import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { createTestConvex } from "./testHarness";

const adminIdentity = {
  subject: "admin-user-id",
  email: "admin@example.com",
};
const ownerIdentity = {
  subject: "owner-user-id",
  email: "owner@example.com",
};
const secondOwnerIdentity = {
  subject: "second-owner-user-id",
  email: "second-owner@example.com",
};
const memberIdentity = {
  subject: "member-user-id",
  email: "member@example.com",
};
const gccIdentity = {
  subject: "gcc-user-id",
  email: "gcc@example.com",
};

describe("notifications", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    process.env.ADMIN_CLERK_USER_IDS = adminIdentity.subject;
    t = createTestConvex();
    vi.unstubAllGlobals();
    delete process.env.RESEND_API_KEY;
  });

  it("fans out company edit approvals to active owners and the submitter with dedupe", async () => {
    const companyId = await seedCompany(t);
    const editId = await t.run((ctx) =>
      ctx.db.insert("companyEdits", {
        company_id: companyId,
        user_id: ownerIdentity.subject,
        payload: { description: "Updated description" },
        status: "pending",
        created_at: Date.now(),
      })
    );

    await t.withIdentity(adminIdentity).mutation(api.admin.approveCompanyEdit, {
      edit_id: editId,
    });

    const notifications = await listNotifications(t);
    expect(notifications).toHaveLength(2);
    expect(notifications.map((notification) => notification.recipient_user_id).sort()).toEqual([
      ownerIdentity.subject,
      secondOwnerIdentity.subject,
    ]);
    expect(notifications.every((notification) => notification.type === "provider.company_edit.approved")).toBe(true);
  });

  it("rebuilds related agent search text when a company rename is approved", async () => {
    const companyId = await seedCompany(t);
    const agentId = await seedAgent(t, companyId);
    const editId = await t.run((ctx) =>
      ctx.db.insert("companyEdits", {
        company_id: companyId,
        user_id: ownerIdentity.subject,
        payload: { name: "Orbit Systems" },
        status: "pending",
        created_at: Date.now(),
      })
    );

    await t.withIdentity(adminIdentity).mutation(api.admin.approveCompanyEdit, {
      edit_id: editId,
    });

    const agent = await t.run((ctx) => ctx.db.get(agentId));
    const card = await t.run((ctx) =>
      ctx.db
        .query("agentDirectoryCards")
        .withIndex("by_agentId", (q) => q.eq("agent_id", agentId))
        .unique()
    );
    expect(agent?.search_text).toContain("Orbit Systems");
    expect(agent?.search_text).toContain("Workflow triage");
    expect(card?.company_name).toBe("Orbit Systems");
  });

  it("creates a provider notification for approved company submissions", async () => {
    const submissionId = await t.run((ctx) =>
      ctx.db.insert("companySubmissions", {
        user_id: ownerIdentity.subject,
        contact_email: ownerIdentity.email,
        company_name: "Launchpad AI",
        website: "https://launchpad.example.com",
        description: "Launchpad builds enterprise orchestration tools for operations teams.",
        headquarters: "Bengaluru, India",
        primary_verticals: ["Technology"],
        status: "pending",
        created_at: Date.now(),
        updated_at: Date.now(),
      })
    );

    await t.withIdentity(adminIdentity).mutation(api.admin.approveCompanySubmission, {
      submission_id: submissionId,
    });

    const notifications = await listNotifications(t);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]?.recipient_user_id).toBe(ownerIdentity.subject);
    expect(notifications[0]?.type).toBe("provider.company_submission.approved");
    expect(notifications[0]?.link).toBe("/provider/setup");
  });

  it("creates a GCC notification when a contact request is rejected", async () => {
    const companyId = await seedCompany(t);
    const agentId = await seedAgent(t, companyId);
    const requestId = await t.run((ctx) =>
      ctx.db.insert("providerRequests", {
        company_id: companyId,
        gcc_user_id: gccIdentity.subject,
        gcc_name: "GCC User",
        gcc_email: gccIdentity.email,
        gcc_organization: "Acme GCC",
        gcc_industry: "Technology",
        agent_id: agentId,
        use_case: "Vendor evaluation",
        current_challenge: "Need to shortlist providers.",
        expected_outcome: "Schedule a discovery call.",
        timeline: "This quarter",
        status: "pending_admin",
        created_at: Date.now(),
      })
    );

    await t.withIdentity(adminIdentity).action(api.admin.rejectContactRequest, {
      request_id: requestId,
      notes: "This request needs more context before we can proceed.",
    });

    const notifications = await listNotifications(t);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]?.recipient_user_id).toBe(gccIdentity.subject);
    expect(notifications[0]?.type).toBe("gcc.contact_request.rejected");
    expect(notifications[0]?.body).toContain("This request needs more context");
  });

  it("marks notifications read and rejects cross-user access", async () => {
    const notificationId = await t.run((ctx) =>
      ctx.db.insert("notifications", {
        recipient_user_id: ownerIdentity.subject,
        audience_role: "provider",
        type: "provider.agent_submission.approved",
        title: "Approved",
        body: "Your agent is live.",
        link: "/dashboard?tab=agents",
        entity_type: "agentSubmission",
        entity_id: "submission-1",
        dedupe_key: "provider.agent_submission.approved:submission-1:owner-user-id",
        created_at: Date.now(),
      })
    );

    expect(await t.withIdentity(ownerIdentity).query(api.notifications.getUnreadCount, {})).toBe(1);

    await t.withIdentity(ownerIdentity).mutation(api.notifications.markRead, {
      notification_id: notificationId,
    });

    expect(await t.withIdentity(ownerIdentity).query(api.notifications.getUnreadCount, {})).toBe(0);
    const unreadStateAfterSingleRead = await t.run((ctx) =>
      ctx.db
        .query("notificationUserStates")
        .withIndex("by_userId", (q) => q.eq("user_id", ownerIdentity.subject))
        .unique()
    );
    expect(unreadStateAfterSingleRead?.unread_count).toBe(0);

    await expect(
      t.withIdentity(secondOwnerIdentity).mutation(api.notifications.markRead, {
        notification_id: notificationId,
      })
    ).rejects.toThrow("Not authorized to update this notification");

    const secondNotificationId = await t.run((ctx) =>
      ctx.db.insert("notifications", {
        recipient_user_id: ownerIdentity.subject,
        audience_role: "provider",
        type: "provider.company_edit.approved",
        title: "Company profile update approved",
        body: "Your changes are live.",
        link: "/dashboard?tab=profile",
        entity_type: "companyEdit",
        entity_id: "edit-2",
        dedupe_key: "provider.company_edit.approved:edit-2:owner-user-id",
        created_at: Date.now(),
      })
    );

    await t.withIdentity(ownerIdentity).mutation(api.notifications.markAllRead, {});
    expect(await t.withIdentity(ownerIdentity).query(api.notifications.getUnreadCount, {})).toBe(0);
    const unreadStateAfterMarkAll = await t.run((ctx) =>
      ctx.db
        .query("notificationUserStates")
        .withIndex("by_userId", (q) => q.eq("user_id", ownerIdentity.subject))
        .unique()
    );
    expect(unreadStateAfterMarkAll?.unread_count).toBe(0);

    const secondNotification = await t.run((ctx) => ctx.db.get(secondNotificationId));
    expect(secondNotification?.read_at).toBeTypeOf("number");
  });

  it("creates an in-app-only owner notification when a team invite is accepted", async () => {
    const companyId = await seedCompany(t);
    await t.run((ctx) =>
      ctx.db.insert("companyMembers", {
        company_id: companyId,
        email: memberIdentity.email,
        role: "member",
        status: "pending",
        invited_by: ownerIdentity.subject,
        created_at: Date.now(),
        updated_at: Date.now(),
      })
    );

    await t.withIdentity(memberIdentity).mutation(api.companyMembers.acceptPendingInvite, {});

    const notifications = await listNotifications(t);
    expect(notifications).toHaveLength(2);
    expect(notifications.every((notification) => notification.type === "provider.team_invite.accepted")).toBe(true);
    expect(notifications.every((notification) => notification.emailed_at === undefined)).toBe(true);
  });

  it("sends notification emails through the shared helper and marks the row emailed", async () => {
    process.env.RESEND_API_KEY = "resend_test_key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response)
    );

    const notificationId = await t.run((ctx) =>
      ctx.db.insert("notifications", {
        recipient_user_id: ownerIdentity.subject,
        audience_role: "provider",
        type: "provider.agent_submission.approved",
        title: "Agent submission approved",
        body: "Your agent is live.",
        link: "/dashboard?tab=agents",
        entity_type: "agentSubmission",
        entity_id: "submission-2",
        dedupe_key: "provider.agent_submission.approved:submission-2:owner-user-id",
        created_at: Date.now(),
      })
    );

    await t.action(internal.notifications.sendNotificationEmail, {
      notification_id: notificationId,
      recipient_email: ownerIdentity.email,
      title: "Agent submission approved",
      body: "Your agent is live.",
      link: "/dashboard?tab=agents",
      cta_label: "View update",
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    const notification = await t.run((ctx) => ctx.db.get(notificationId));
    expect(notification?.emailed_at).toBeTypeOf("number");
  });
});

async function listNotifications(t: ReturnType<typeof createTestConvex>) {
  return await t.run((ctx) => ctx.db.query("notifications").collect());
}

async function seedCompany(t: ReturnType<typeof createTestConvex>) {
  return await t.run(async (ctx) => {
    const companyId = await ctx.db.insert("companies", {
      slug: "acme-systems",
      name: "Acme Systems",
      description: "Acme Systems builds enterprise AI products for global delivery teams.",
      website: "https://acme.example.com",
      headquarters: "Bengaluru, India",
      primary_verticals: ["Technology"],
      contact_email: ownerIdentity.email,
      verification_status: "verified",
      claim_status: "claimed",
      claimed_by_user_id: ownerIdentity.subject,
      claimed_at: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await ctx.db.insert("companyMembers", {
      company_id: companyId,
      user_id: ownerIdentity.subject,
      email: ownerIdentity.email,
      role: "owner",
      status: "active",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await ctx.db.insert("companyMembers", {
      company_id: companyId,
      user_id: secondOwnerIdentity.subject,
      email: secondOwnerIdentity.email,
      role: "owner",
      status: "active",
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return companyId;
  });
}

async function seedAgent(
  t: ReturnType<typeof createTestConvex>,
  companyId: Id<"companies">
) {
  return await t.run((ctx) =>
    ctx.db.insert("agents", {
      slug: "acme-agent",
      agent_name: "Acme Agent",
      description: "An enterprise agent for GCC operations teams.",
      category: "Operations",
      company_id: companyId,
      use_cases: [{ title: "Workflow triage", description: "Prioritize incoming requests." }],
      functional_categories: ["IT Operations"],
      industry_categories: ["Technology"],
      industries: ["Technology"],
      status: "active",
      created_at: Date.now(),
      updated_at: Date.now(),
    })
  );
}
