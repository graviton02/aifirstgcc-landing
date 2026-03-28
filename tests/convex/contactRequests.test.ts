import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { createTestConvex } from "./testHarness";

const adminToken = "admin-session-token";
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

    await seedAdminSession(t);
    await t.action(api.admin.approveContactRequest, {
      token: adminToken,
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

    await seedAdminSession(t);
    await t.action(api.admin.rejectContactRequest, {
      token: adminToken,
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
      company_size: "201-500 employees",
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

async function seedAdminSession(t: ReturnType<typeof createTestConvex>) {
  await t.run((ctx) =>
    ctx.db.insert("adminSessions", {
      session_token: adminToken,
      expires_at: Date.now() + 60_000,
      created_at: Date.now(),
    })
  );
}
