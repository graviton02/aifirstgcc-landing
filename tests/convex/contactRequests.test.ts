import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { createTestConvex } from "./testHarness";

const adminIdentity = {
  subject: "admin-user-id",
  email: "admin@example.com",
};
const providerOwnerIdentity = {
  subject: "provider-owner-id",
  email: "owner@acme.example",
};
const providerMemberIdentity = {
  subject: "provider-member-id",
  email: "sales@acme.example",
};
const gccIdentity = {
  subject: "gcc-user-id",
  email: "buyer@gcc.example",
};
const otherIdentity = {
  subject: "not-gcc-user-id",
  email: "other@example.com",
};

describe("contact request workflows", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    process.env.ADMIN_CLERK_USER_IDS = adminIdentity.subject;
    t = createTestConvex();
  });

  it("stores the GCC snapshot and structured reachout fields", async () => {
    const { agentId } = await seedProviderCompany(t);

    await t.withIdentity(gccIdentity).mutation(api.gccProfiles.createProfile, {
      name: "Priya Sharma",
      email: "priya@gcc.example",
      organization: "Global Capability Center",
      industry: "Financial Services (BFSI)",
    });

    const requestId = await t
      .withIdentity(gccIdentity)
      .mutation(api.gcc.createContactRequest, {
        agent_id: agentId,
        use_case: "Automate L1 incident triage",
        current_challenge:
          "We still route incidents manually across email and ticket queues.",
        expected_outcome:
          "Reduce triage time and give service managers clean routing visibility.",
        timeline: "Need to move this quarter",
        request_source: "agent_detail",
      });

    const request = await t.run((ctx) => ctx.db.get(requestId));

    expect(request).toMatchObject({
      company_id: expect.any(String),
      agent_id: agentId,
      gcc_user_id: gccIdentity.subject,
      gcc_name: "Priya Sharma",
      gcc_email: "priya@gcc.example",
      gcc_organization: "Global Capability Center",
      gcc_industry: "Financial Services (BFSI)",
      use_case: "Automate L1 incident triage",
      current_challenge:
        "We still route incidents manually across email and ticket queues.",
      expected_outcome:
        "Reduce triage time and give service managers clean routing visibility.",
      timeline: "Need to move this quarter",
      request_source: "agent_detail",
      status: "pending_admin",
    });
  });

  it("requires completed GCC onboarding before a request can be created", async () => {
    const { agentId } = await seedProviderCompany(t);

    await expect(
      t.withIdentity(otherIdentity).mutation(api.gcc.createContactRequest, {
        agent_id: agentId,
        use_case: "Automate intake",
        current_challenge: "Our intake team still works from spreadsheets today.",
        expected_outcome: "Move intake into a governed workflow quickly.",
        timeline: "Targeting a pilot in 1-3 months",
        request_source: "agent_detail",
      })
    ).rejects.toThrow("Complete GCC onboarding before contacting providers.");
  });

  it.each(["pending_admin", "approved", "contacted"] as const)(
    "blocks duplicate requests for the same GCC user and provider when status is %s",
    async (status) => {
      const { companyId, agentId } = await seedProviderCompany(t);

      await t.withIdentity(gccIdentity).mutation(api.gccProfiles.createProfile, {
        name: "Priya Sharma",
        email: "priya@gcc.example",
        organization: "Global Capability Center",
        industry: "Financial Services (BFSI)",
      });

      await seedLegacyContactRequest(t, {
        agentId,
        companyId,
        status,
      });

      const existingRequest = await t
        .withIdentity(gccIdentity)
        .query(api.gcc.getMyProviderRequestStatus, {
          company_id: companyId,
        });

      expect(existingRequest?.status).toBe(status);

      await expect(
        t.withIdentity(gccIdentity).mutation(api.gcc.createContactRequest, {
          agent_id: agentId,
          use_case: "Automate vendor response workflows",
          current_challenge:
            "Teams coordinate vendor follow-ups manually and lose status visibility.",
          expected_outcome:
            "Shorten turnaround times and improve leadership reporting on vendor asks.",
          timeline: "Already evaluating vendors now",
          request_source: "company_profile",
        })
      ).rejects.toThrow("You have already contacted this provider.");
    }
  );

  it("allows a new request when earlier requests were rejected or archived", async () => {
    const { companyId, agentId } = await seedProviderCompany(t);

    await t.withIdentity(gccIdentity).mutation(api.gccProfiles.createProfile, {
      name: "Priya Sharma",
      email: "priya@gcc.example",
      organization: "Global Capability Center",
      industry: "Financial Services (BFSI)",
    });

    await seedLegacyContactRequest(t, {
      agentId,
      companyId,
      status: "rejected",
    });
    await seedLegacyContactRequest(t, {
      agentId,
      companyId,
      status: "archived",
    });

    const existingRequest = await t
      .withIdentity(gccIdentity)
      .query(api.gcc.getMyProviderRequestStatus, {
        company_id: companyId,
      });

    expect(existingRequest).toBeNull();

    const requestId = await t
      .withIdentity(gccIdentity)
      .mutation(api.gcc.createContactRequest, {
        agent_id: agentId,
        use_case: "Automate intake",
        current_challenge:
          "Our intake team still works from spreadsheets and email handoffs today.",
        expected_outcome:
          "Move intake into a governed workflow with clean stakeholder visibility.",
        timeline: "Targeting a pilot in 1-3 months",
        request_source: "agent_detail",
      });

    const request = await t.run((ctx) => ctx.db.get(requestId));
    expect(request?.status).toBe("pending_admin");
  });

  it("shows approved leads to all active provider members and lets them mark leads contacted", async () => {
    const { agentId } = await seedProviderCompany(t);

    await t.withIdentity(gccIdentity).mutation(api.gccProfiles.createProfile, {
      name: "Priya Sharma",
      email: "priya@gcc.example",
      organization: "Global Capability Center",
      industry: "Financial Services (BFSI)",
    });

    const requestId = await t
      .withIdentity(gccIdentity)
      .mutation(api.gcc.createContactRequest, {
        agent_id: agentId,
        use_case: "Automate vendor response workflows",
        current_challenge:
          "Teams coordinate vendor follow-ups manually and lose status visibility.",
        expected_outcome:
          "Shorten turnaround times and improve leadership reporting on vendor asks.",
        timeline: "Already evaluating vendors now",
        request_source: "company_profile",
      });

    await t.withIdentity(adminIdentity).action(api.admin.approveContactRequest, {
      request_id: requestId,
    });

    const ownerLeads = await t
      .withIdentity(providerOwnerIdentity)
      .query(api.providerRequests.getMyCompanyLeads, {});
    const memberLeads = await t
      .withIdentity(providerMemberIdentity)
      .query(api.providerRequests.getMyCompanyLeads, {});

    expect(ownerLeads).toHaveLength(1);
    expect(memberLeads).toHaveLength(1);
    expect(ownerLeads[0]?.status).toBe("approved");

    await t.withIdentity(providerMemberIdentity).action(
      api.providerRequests.markLeadContacted,
      {
        request_id: requestId,
      }
    );

    const updatedRequest = await t.run((ctx) => ctx.db.get(requestId));
    expect(updatedRequest?.status).toBe("contacted");
    expect(updatedRequest?.contacted_by_user_id).toBe(providerMemberIdentity.subject);
    expect(updatedRequest?.contacted_at).toBeDefined();

    const contactLogs = await t.run((ctx) =>
      ctx.db
        .query("contactLogs")
        .withIndex("by_gccUserId", (q) => q.eq("gcc_user_id", gccIdentity.subject))
        .collect()
    );
    expect(contactLogs).toHaveLength(1);
    expect(contactLogs[0]?.agent_id).toBe(agentId);

    const gccRequests = await t
      .withIdentity(gccIdentity)
      .query(api.gcc.getMyContactRequests, {});
    expect(gccRequests[0]?.status).toBe("contacted");
    expect(gccRequests[0]?.agent?.agent_name).toBe("Acme Pilot");
  });

  it("keeps rejected requests hidden from provider leads", async () => {
    const { agentId } = await seedProviderCompany(t);

    await t.withIdentity(gccIdentity).mutation(api.gccProfiles.createProfile, {
      name: "Priya Sharma",
      email: "priya@gcc.example",
      organization: "Global Capability Center",
      industry: "Financial Services (BFSI)",
    });

    const requestId = await t
      .withIdentity(gccIdentity)
      .mutation(api.gcc.createContactRequest, {
        agent_id: agentId,
        use_case: "Automate finance close tasks",
        current_challenge:
          "The current brief is too early and the use case is not scoped yet.",
        expected_outcome: "Understand what this provider can support first.",
        timeline: "Exploring in the next 6 months",
        request_source: "agent_detail",
      });

    await t.withIdentity(adminIdentity).action(api.admin.rejectContactRequest, {
      request_id: requestId,
      notes: "Please narrow the scope before routing this provider introduction.",
    });

    const providerLeads = await t
      .withIdentity(providerOwnerIdentity)
      .query(api.providerRequests.getMyCompanyLeads, {});

    expect(providerLeads).toHaveLength(0);

    const request = await t.run((ctx) => ctx.db.get(requestId));
    expect(request?.status).toBe("rejected");
    expect(request?.admin_notes).toBe(
      "Please narrow the scope before routing this provider introduction."
    );
  });

  it("normalizes legacy rows across GCC, provider, and admin flows", async () => {
    const { companyId, agentId } = await seedProviderCompany(t);

    const requestId = await seedLegacyContactRequest(t, {
      agentId,
      companyId,
      status: "pending_admin",
    });

    await t.withIdentity(adminIdentity).action(api.admin.approveContactRequest, {
      request_id: requestId,
    });

    const providerLeads = await t
      .withIdentity(providerOwnerIdentity)
      .query(api.providerRequests.getMyCompanyLeads, {});
    const gccRequests = await t
      .withIdentity(gccIdentity)
      .query(api.gcc.getMyContactRequests, {});
    const history = await t.withIdentity(adminIdentity).query(
      api.admin.getContactRequestsHistory,
      {}
    );

    expect(providerLeads).toHaveLength(1);
    expect(gccRequests).toHaveLength(1);
    expect(history).toHaveLength(1);

    expect(providerLeads[0]).toMatchObject({
      status: "approved",
      gcc_name: "Unknown GCC",
      gcc_email: gccIdentity.email,
      gcc_organization: "Unknown organization",
      gcc_industry: "Unknown industry",
      use_case: "Not provided",
      current_challenge:
        "Legacy provider request message from the previous schema.",
      expected_outcome: "Not provided",
      timeline: "Not specified",
    });

    expect(gccRequests[0]).toMatchObject({
      status: "approved",
      current_challenge:
        "Legacy provider request message from the previous schema.",
      use_case: "Not provided",
      expected_outcome: "Not provided",
      timeline: "Not specified",
    });

    expect(history[0]).toMatchObject({
      status: "approved",
      current_challenge:
        "Legacy provider request message from the previous schema.",
      use_case: "Not provided",
      expected_outcome: "Not provided",
      timeline: "Not specified",
    });
  });

  it("backfills missing structured fields for legacy provider requests", async () => {
    const { companyId, agentId } = await seedProviderCompany(t);

    await t.withIdentity(gccIdentity).mutation(api.gccProfiles.createProfile, {
      name: "Priya Sharma",
      email: "profile@gcc.example",
      organization: "Global Capability Center",
      industry: "Financial Services (BFSI)",
    });

    const requestId = await seedLegacyContactRequest(t, {
      agentId,
      companyId,
      status: "approved",
    });

    const firstRun = await t.withIdentity(adminIdentity).action(
      api.admin.backfillLegacyProviderRequests,
      {}
    );

    expect(firstRun).toEqual({
      scanned: 1,
      patched: 1,
      skipped: 0,
    });

    const request = await t.run((ctx) => ctx.db.get(requestId));

    expect(request).toMatchObject({
      status: "approved",
      gcc_name: "Priya Sharma",
      gcc_email: gccIdentity.email,
      gcc_organization: "Global Capability Center",
      gcc_industry: "Financial Services (BFSI)",
      use_case: "Legacy provider introduction",
      current_challenge:
        "Legacy provider request message from the previous schema.",
      expected_outcome: "Provider follow-up requested.",
      timeline: "Not specified",
      message: "Legacy provider request message from the previous schema.",
      gcc_org_id: "org_legacy_request",
      provider_profile_id: "legacy-profile-id",
    });

    const secondRun = await t.withIdentity(adminIdentity).action(
      api.admin.backfillLegacyProviderRequests,
      {}
    );

    expect(secondRun).toEqual({
      scanned: 1,
      patched: 0,
      skipped: 1,
    });
  });
});

async function seedProviderCompany(t: ReturnType<typeof createTestConvex>) {
  const now = Date.now();

  const companyId = await t.run((ctx) =>
    ctx.db.insert("companies", {
      slug: "acme-systems",
      name: "Acme Systems",
      description:
        "Acme Systems builds enterprise automation products for global service delivery teams.",
      website: "https://acme.example.com",
      headquarters: "Bengaluru, India",
      primary_verticals: ["Technology"],
      contact_email: "hello@acme.example.com",
      verification_status: "verified",
      claim_status: "claimed",
      claimed_by_user_id: providerOwnerIdentity.subject,
      claimed_at: now,
      created_at: now,
      updated_at: now,
    })
  );

  await t.run((ctx) =>
    Promise.all([
      ctx.db.insert("companyMembers", {
        company_id: companyId,
        user_id: providerOwnerIdentity.subject,
        email: providerOwnerIdentity.email,
        role: "owner",
        status: "active",
        created_at: now,
        updated_at: now,
      }),
      ctx.db.insert("companyMembers", {
        company_id: companyId,
        user_id: providerMemberIdentity.subject,
        email: providerMemberIdentity.email,
        role: "member",
        status: "active",
        created_at: now,
        updated_at: now,
      }),
    ])
  );

  const agentId = await t.run((ctx) =>
    ctx.db.insert("agents", {
      slug: "acme-pilot",
      agent_name: "Acme Pilot",
      tagline: "Routes enterprise work faster",
      description:
        "Acme Pilot automates triage, workflow routing, and structured follow-up for enterprise teams.",
      category: "Operations",
      company_id: companyId,
      use_cases: [
        {
          title: "Incident routing",
          description: "Routes and classifies enterprise incidents automatically.",
        },
      ],
      functional_categories: ["IT Operations"],
      industry_categories: ["Technology"],
      status: "active",
      search_text: "Acme Pilot automation routing operations",
      created_at: now,
      updated_at: now,
    })
  );

  return {
    companyId,
    agentId: agentId as Id<"agents">,
  };
}

async function seedLegacyContactRequest(
  t: ReturnType<typeof createTestConvex>,
  {
    agentId,
    companyId,
    status,
  }: {
    agentId: Id<"agents">;
    companyId: Id<"companies">;
    status: "pending_admin" | "approved" | "rejected" | "contacted" | "archived";
  }
) {
  return await t.run((ctx) =>
    ctx.db.insert("providerRequests", {
      company_id: companyId,
      gcc_user_id: gccIdentity.subject,
      agent_id: agentId,
      status,
      created_at: Date.now(),
      gcc_user_email: gccIdentity.email,
      message: "Legacy provider request message from the previous schema.",
      gcc_org_id: "org_legacy_request",
      provider_profile_id: "legacy-profile-id",
    })
  );
}
