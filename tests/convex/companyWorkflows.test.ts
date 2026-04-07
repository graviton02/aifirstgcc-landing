import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { createTestConvex } from "./testHarness";

const adminIdentity = {
  subject: "admin-user-id",
  email: "admin@example.com",
};
const providerIdentity = {
  subject: "provider-user-id",
  email: "owner@example.com",
};
const otherIdentity = {
  subject: "other-user-id",
  email: "member@example.com",
};

function buildInitialAgent() {
  return {
    agent_name: "Ops Pilot",
    tagline: "Enterprise operations copiloting",
    description:
      "Automates ticket triage, workflow routing, and follow-up tasks across enterprise operations teams.",
    category: "Operations",
    functional_categories: ["IT Operations"],
    industry_categories: ["Technology"],
    use_cases: [
      {
        title: "Ticket triage",
        description: "Routes operational issues to the right support queue.",
      },
    ],
    integrations: ["Slack"],
    expected_outcomes: ["Faster response times"],
    source_url: "https://example.com/source",
    demo_url: "https://example.com/demo",
  };
}

function buildCompanySubmissionArgs() {
  return {
    contact_email: "owner@example.com",
    company_name: "Acme Systems",
    website: "https://acme.example.com",
    description:
      "Acme Systems builds enterprise automation products for global delivery teams and shared services organizations.",
    headquarters: "Bengaluru, India",
    logo_storage_id: "storage-logo-1" as any,
    logo_bg: "dark",
    primary_verticals: ["Technology"],
    initial_agent: buildInitialAgent(),
  };
}

describe("company and membership workflows", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    process.env.ADMIN_CLERK_USER_IDS = adminIdentity.subject;
    t = createTestConvex();
  });

  it("approves a company submission, creates owner membership, and queues the initial agent", async () => {
    const submissionId = await t
      .withIdentity(providerIdentity)
      .mutation(api.companySubmissions.create, buildCompanySubmissionArgs());

    await t.withIdentity(adminIdentity).mutation(api.admin.approveCompanySubmission, {
      submission_id: submissionId,
    });

    const approvedSubmission = await t.run((ctx) => ctx.db.get(submissionId));
    expect(approvedSubmission?.status).toBe("approved");
    expect(approvedSubmission?.created_company_id).toBeDefined();
    expect(approvedSubmission?.initial_agent_submission_id).toBeDefined();

    const companyId = approvedSubmission?.created_company_id as Id<"companies">;
    const createdCompany = await t.run((ctx) => ctx.db.get(companyId));
    expect(createdCompany?.name).toBe("Acme Systems");
    expect(createdCompany?.claimed_by_user_id).toBe(providerIdentity.subject);
    expect(createdCompany?.logo_storage_id).toBe("storage-logo-1");
    expect(createdCompany?.logo_bg).toBe("dark");

    const members = await t.run((ctx) =>
      ctx.db
        .query("companyMembers")
        .withIndex("by_companyId", (q) => q.eq("company_id", companyId))
        .collect()
    );
    expect(members).toHaveLength(1);
    expect(members[0]?.role).toBe("owner");
    expect(members[0]?.status).toBe("active");

    const queuedAgent = await t.run((ctx) =>
      ctx.db.get(approvedSubmission?.initial_agent_submission_id as Id<"agentSubmissions">)
    );
    expect(queuedAgent?.submission_status).toBe("pending");
    expect(queuedAgent?.company_id).toBe(companyId);
    expect(queuedAgent?.functional_categories).toEqual(["IT Operations"]);
    expect(queuedAgent?.industry_categories).toEqual(["Technology"]);

    const providerProfile = await t.run((ctx) =>
      ctx.db
        .query("providerProfiles")
        .withIndex("by_userId", (q) => q.eq("user_id", providerIdentity.subject))
        .unique()
    );
    expect(providerProfile?.onboarding_path).toBe("create_new");

    const mine = await t
      .withIdentity(providerIdentity)
      .query(api.companySubmissions.getMine, {});
    expect(mine?.created_company_name).toBe("Acme Systems");
    expect(mine?.initial_agent_submission?.agent_name).toBe("Ops Pilot");
  });

  it("allows only active company members to read team membership", async () => {
    const { companyId } = await createApprovedCompany(t);

    const ownerView = await t
      .withIdentity(providerIdentity)
      .query(api.companyMembers.getMembers, { company_id: companyId });

    expect(ownerView).toHaveLength(1);
    expect(ownerView[0]?.role).toBe("owner");

    await expect(
      t.withIdentity(otherIdentity).query(api.companyMembers.getMembers, {
        company_id: companyId,
      })
    ).rejects.toThrow("Not authorized to view team members");
  });

  it("removes legacy company size values from stored provider documents", async () => {
    const now = Date.now();
    const companyId = await t.run((ctx) =>
      ctx.db.insert("companies", {
        slug: "legacy-company",
        name: "Legacy Company",
        description: "A legacy directory entry with deprecated size metadata.",
        website: "https://legacy.example.com",
        headquarters: "Hyderabad, India",
        company_size: "201-500",
        primary_verticals: ["Technology"],
        verification_status: "verified",
        claim_status: "claimed",
        created_at: now,
        updated_at: now,
      })
    );

    const submissionId = await t.run((ctx) =>
      ctx.db.insert("companySubmissions", {
        user_id: providerIdentity.subject,
        contact_email: providerIdentity.email,
        company_name: "Legacy Submission",
        website: "https://legacy-submission.example.com",
        description: "A pending provider submission that still has deprecated size metadata.",
        headquarters: "Pune, India",
        company_size: "11-50",
        primary_verticals: ["Technology"],
        status: "pending",
        created_at: now,
        updated_at: now,
      })
    );

    const profileId = await t.run((ctx) =>
      ctx.db.insert("providerProfiles", {
        user_id: providerIdentity.subject,
        company_size: "11-50",
        created_at: now,
        updated_at: now,
      })
    );

    const result = await t
      .withIdentity(adminIdentity)
      .mutation(api.admin.removeLegacyCompanySizeData, {});

    expect(result.totalPatched).toBe(3);
    expect((await t.run((ctx) => ctx.db.get(companyId)))?.company_size).toBeUndefined();
    expect((await t.run((ctx) => ctx.db.get(submissionId)))?.company_size).toBeUndefined();
    expect((await t.run((ctx) => ctx.db.get(profileId)))?.company_size).toBeUndefined();
  });

  it("does not create provider access from Clerk org sync alone", async () => {
    const result = await t.withIdentity(otherIdentity).mutation(
      api.companyMembers.syncClerkMemberships,
      {
        memberships: [{ clerk_org_id: "org_123", role: "org:member" }],
      }
    );

    expect(result).toEqual({
      synced_count: 0,
      user_id: otherIdentity.subject,
      memberships: [{ clerk_org_id: "org_123", role: "org:member" }],
    });

    const company = await t.withIdentity(otherIdentity).query(api.companyMembers.getMyCompany, {});
    expect(company).toBeNull();
  });

  it("rejects activating a second company membership through invite acceptance", async () => {
    const { companyId } = await createApprovedCompany(t);
    const otherCompanyId = await t.run((ctx) =>
      ctx.db.insert("companies", {
        slug: "second-company",
        name: "Second Company",
        description: "Another provider company.",
        website: "https://second.example.com",
        headquarters: "Pune, India",
        primary_verticals: ["Technology"],
        contact_email: "team@second.example.com",
        verification_status: "verified",
        claim_status: "claimed",
        created_at: Date.now(),
        updated_at: Date.now(),
      })
    );

    await t.run((ctx) =>
      ctx.db.insert("companyMembers", {
        company_id: otherCompanyId,
        email: providerIdentity.email,
        role: "member",
        status: "pending",
        created_at: Date.now(),
        updated_at: Date.now(),
      })
    );

    const result = await t
      .withIdentity(providerIdentity)
      .mutation(api.companyMembers.acceptPendingInvite, {});

    expect(result).toEqual({
      status: "conflict",
      message:
        "This account already has access to another provider company. Use a different email or contact support to resolve the invite.",
    });

    const currentMemberships = await t.run((ctx) =>
      ctx.db
        .query("companyMembers")
        .withIndex("by_userId", (q) => q.eq("user_id", providerIdentity.subject))
        .collect()
    );
    expect(currentMemberships).toHaveLength(1);
    expect(currentMemberships[0]?.company_id).toBe(companyId);
  });

  it("only activates the pending invite that matches the signed-in email", async () => {
    const companyId = await t.run((ctx) =>
      ctx.db.insert("companies", {
        slug: "invite-target",
        name: "Invite Target",
        description: "A provider workspace awaiting invite acceptance.",
        website: "https://invite.example.com",
        headquarters: "Chennai, India",
        primary_verticals: ["Technology"],
        contact_email: "team@invite.example.com",
        verification_status: "verified",
        claim_status: "claimed",
        created_at: Date.now(),
        updated_at: Date.now(),
      })
    );

    const matchingInviteId = await t.run((ctx) =>
      ctx.db.insert("companyMembers", {
        company_id: companyId,
        email: providerIdentity.email,
        role: "member",
        status: "pending",
        created_at: Date.now(),
        updated_at: Date.now(),
      })
    );
    const otherInviteId = await t.run((ctx) =>
      ctx.db.insert("companyMembers", {
        company_id: companyId,
        email: "another-user@example.com",
        role: "member",
        status: "pending",
        created_at: Date.now(),
        updated_at: Date.now(),
      })
    );

    const result = await t
      .withIdentity(providerIdentity)
      .mutation(api.companyMembers.acceptPendingInvite, {});

    expect(result).toMatchObject({
      status: "accepted",
      company_id: companyId,
    });

    const matchingInvite = await t.run((ctx) => ctx.db.get(matchingInviteId));
    const otherInvite = await t.run((ctx) => ctx.db.get(otherInviteId));
    expect(matchingInvite?.status).toBe("active");
    expect(matchingInvite?.user_id).toBe(providerIdentity.subject);
    expect(otherInvite?.status).toBe("pending");
    expect(otherInvite?.user_id).toBeUndefined();
  });

  it("blocks admin approval for non-allowlisted identities", async () => {
    const submissionId = await t
      .withIdentity(providerIdentity)
      .mutation(api.companySubmissions.create, buildCompanySubmissionArgs());

    await expect(
      t.withIdentity(providerIdentity).mutation(api.admin.approveCompanySubmission, {
        submission_id: submissionId,
      })
    ).rejects.toThrow("Admin access required");
  });
});

async function createApprovedCompany(t: ReturnType<typeof createTestConvex>) {
  const submissionId = await t
    .withIdentity(providerIdentity)
    .mutation(api.companySubmissions.create, buildCompanySubmissionArgs());

  await t.withIdentity(adminIdentity).mutation(api.admin.approveCompanySubmission, {
    submission_id: submissionId,
  });

  const submission = await t.run((ctx) => ctx.db.get(submissionId));
  if (!submission?.created_company_id) {
    throw new Error("Company approval did not create a company");
  }

  return {
    submissionId,
    companyId: submission.created_company_id,
    initialAgentSubmissionId: submission.initial_agent_submission_id,
  };
}
