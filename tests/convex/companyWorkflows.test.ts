import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { createTestConvex } from "./testHarness";

const adminToken = "admin-session-token";
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
    infrastructure_categories: ["Cloud & Infrastructure"],
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
    company_size: "201-500",
    primary_verticals: ["Technology"],
    initial_agent: buildInitialAgent(),
  };
}

describe("company and membership workflows", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    t = createTestConvex();
  });

  it("approves a company submission, creates owner membership, and queues the initial agent", async () => {
    const submissionId = await t
      .withIdentity(providerIdentity)
      .mutation(api.companySubmissions.create, buildCompanySubmissionArgs());

    await seedAdminSession(t);

    await t.mutation(api.admin.approveCompanySubmission, {
      token: adminToken,
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
});

async function createApprovedCompany(t: ReturnType<typeof createTestConvex>) {
  const submissionId = await t
    .withIdentity(providerIdentity)
    .mutation(api.companySubmissions.create, buildCompanySubmissionArgs());

  await seedAdminSession(t);
  await t.mutation(api.admin.approveCompanySubmission, {
    token: adminToken,
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

async function seedAdminSession(t: ReturnType<typeof createTestConvex>) {
  await t.run((ctx) =>
    ctx.db.insert("adminSessions", {
      session_token: adminToken,
      expires_at: Date.now() + 60_000,
      created_at: Date.now(),
    })
  );
}
