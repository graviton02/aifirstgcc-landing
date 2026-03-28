import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { createTestConvex } from "./testHarness";

const adminToken = "admin-session-token";
const providerIdentity = {
  subject: "provider-user-id",
  email: "owner@example.com",
};
const outsiderIdentity = {
  subject: "outsider-user-id",
  email: "outsider@example.com",
};

describe("agent workflows", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    t = createTestConvex();
  });

  it("rejects agent submissions that do not meet required taxonomy and use-case rules", async () => {
    const companyId = await seedCompany(t);

    await expect(
      t.withIdentity(providerIdentity).mutation(api.agents.submit, {
        company_id: companyId,
        agent_name: "Incomplete Agent",
        description: "Missing the taxonomy and use-case fields required for approval.",
        category: "Operations",
        use_cases: [],
        functional_categories: [],
        industry_categories: [],
      })
    ).rejects.toThrow("Select at least one functional category.");
  });

  it("rejects agent edit approvals when the merged final record becomes invalid", async () => {
    const companyId = await seedCompany(t);
    const agentId = await seedAgent(t, companyId);
    const editId = await t.run((ctx) =>
      ctx.db.insert("agentEdits", {
        agent_id: agentId,
        user_id: providerIdentity.subject,
        payload: {
          functional_categories: [],
        },
        status: "pending",
        created_at: Date.now(),
      })
    );

    await seedAdminSession(t);

    await expect(
      t.mutation(api.admin.approveAgentEdit, {
        token: adminToken,
        edit_id: editId,
      })
    ).rejects.toThrow("Select at least one functional category.");

    const agent = await t.run((ctx) => ctx.db.get(agentId));
    expect(agent?.functional_categories).toEqual(["IT Operations"]);
  });

  it("surfaces company context and validation errors for pending agent reviews", async () => {
    const companyId = await seedCompany(t);

    await t.run((ctx) =>
      ctx.db.insert("agentSubmissions", {
        company_id: companyId,
        user_id: providerIdentity.subject,
        agent_name: "Legacy Pending Agent",
        description: "A legacy submission that predates the stricter validation rules.",
        category: "Operations",
        use_cases: [],
        submission_status: "pending",
        created_at: Date.now(),
        updated_at: Date.now(),
      })
    );

    await seedAdminSession(t);

    const pending = await t.query(api.admin.getPendingAgents, {
      token: adminToken,
    });

    expect(pending).toHaveLength(1);
    expect(pending[0]?.company?.name).toBe("Acme Systems");
    expect(pending[0]?.validation_errors).toEqual(
      expect.arrayContaining([
        "Select at least one functional category.",
        "Select at least one industry category.",
        "Add at least one use case.",
      ])
    );
  });

  it("resubmits change-requested submissions back into the pending queue", async () => {
    const companyId = await seedCompany(t);
    const createdAt = Date.now() - 5_000;
    const reviewedAt = Date.now() - 2_500;
    const submissionId = await t.run((ctx) =>
      ctx.db.insert("agentSubmissions", {
        company_id: companyId,
        user_id: providerIdentity.subject,
        agent_name: "Legacy Pending Agent",
        tagline: "Old tagline",
        description: "Needs changes from admin review.",
        category: "Operations",
        use_cases: [{ title: "Old use case", description: "Legacy description" }],
        functional_categories: ["IT Operations"],
        industry_categories: ["Technology"],
        industries: ["Technology"],
        submission_status: "changes_requested",
        admin_notes: "Please add a better use case.",
        reviewed_at: reviewedAt,
        created_at: createdAt,
        updated_at: reviewedAt,
      })
    );

    await t.withIdentity(providerIdentity).mutation(api.agents.resubmitSubmission, {
      submission_id: submissionId,
      agent_name: "Modernized Pending Agent",
      tagline: "Updated tagline",
      description: "Now includes the requested revisions for review.",
      category: "Operations",
      use_cases: [{ title: "Incident triage", description: "Routes the right cases first." }],
      functional_categories: ["IT Operations"],
      industry_categories: ["Technology"],
      infrastructure_categories: ["Cloud"],
      expected_outcomes: ["Shorter resolution times"],
      integrations: ["ServiceNow"],
      source_url: "https://example.com/source",
      demo_url: "https://example.com/demo",
    });

    const submission = await t.run((ctx) => ctx.db.get(submissionId));
    expect(submission?.submission_status).toBe("pending");
    expect(submission?.admin_notes).toBeUndefined();
    expect(submission?.reviewed_at).toBeUndefined();
    expect(submission?.created_at).toBe(createdAt);
    expect(submission?.updated_at).toBeGreaterThan(reviewedAt);
    expect(submission?.agent_name).toBe("Modernized Pending Agent");
    expect(submission?.user_id).toBe(providerIdentity.subject);
  });

  it("only allows change-requested submissions to be resubmitted", async () => {
    const companyId = await seedCompany(t);

    for (const status of ["pending", "approved", "rejected"] as const) {
      const submissionId = await t.run((ctx) =>
        ctx.db.insert("agentSubmissions", {
          company_id: companyId,
          user_id: providerIdentity.subject,
          agent_name: `${status} submission`,
          description: "Lifecycle status test.",
          category: "Operations",
          use_cases: [{ title: "Test", description: "Status gate." }],
          functional_categories: ["IT Operations"],
          industry_categories: ["Technology"],
          industries: ["Technology"],
          submission_status: status,
          created_at: Date.now(),
          updated_at: Date.now(),
        })
      );

      await expect(
        t.withIdentity(providerIdentity).mutation(api.agents.resubmitSubmission, {
          submission_id: submissionId,
          agent_name: "Updated agent",
          description: "Trying to reopen a non-change-requested submission.",
          category: "Operations",
          use_cases: [{ title: "Updated", description: "Still invalid lifecycle." }],
          functional_categories: ["IT Operations"],
          industry_categories: ["Technology"],
        })
      ).rejects.toThrow("Only submissions with requested changes can be resubmitted");
    }
  });

  it("blocks submit and resubmit operations for users outside the company", async () => {
    const companyId = await seedCompany(t);
    const submissionId = await t.run((ctx) =>
      ctx.db.insert("agentSubmissions", {
        company_id: companyId,
        user_id: providerIdentity.subject,
        agent_name: "Needs Changes",
        description: "Awaiting provider revision.",
        category: "Operations",
        use_cases: [{ title: "Needs update", description: "Admin feedback pending." }],
        functional_categories: ["IT Operations"],
        industry_categories: ["Technology"],
        industries: ["Technology"],
        submission_status: "changes_requested",
        created_at: Date.now(),
        updated_at: Date.now(),
      })
    );

    await expect(
      t.withIdentity(outsiderIdentity).mutation(api.agents.submit, {
        company_id: companyId,
        agent_name: "Unauthorized Agent",
        description: "Should not be accepted for another company.",
        category: "Operations",
        use_cases: [{ title: "Unauthorized", description: "No membership." }],
        functional_categories: ["IT Operations"],
        industry_categories: ["Technology"],
      })
    ).rejects.toThrow("Not authorized for this company");

    await expect(
      t.withIdentity(outsiderIdentity).mutation(api.agents.resubmitSubmission, {
        submission_id: submissionId,
        agent_name: "Unauthorized Update",
        description: "Attempt to revise another company's submission.",
        category: "Operations",
        use_cases: [{ title: "Unauthorized", description: "No membership." }],
        functional_categories: ["IT Operations"],
        industry_categories: ["Technology"],
      })
    ).rejects.toThrow("Not authorized for this company");
  });
});

async function seedCompany(t: ReturnType<typeof createTestConvex>) {
  return await t.run(async (ctx) => {
    const companyId = await ctx.db.insert("companies", {
      slug: "acme-systems",
      name: "Acme Systems",
      description:
        "Acme Systems builds enterprise automation products for global delivery teams and shared services organizations.",
      website: "https://acme.example.com",
      headquarters: "Bengaluru, India",
      company_size: "201-500",
      primary_verticals: ["Technology"],
      contact_email: "owner@example.com",
      verification_status: "verified",
      claim_status: "claimed",
      claimed_by_user_id: providerIdentity.subject,
      claimed_at: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await ctx.db.insert("companyMembers", {
      company_id: companyId,
      user_id: providerIdentity.subject,
      email: providerIdentity.email,
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
      slug: "ops-pilot",
      agent_name: "Ops Pilot",
      description:
        "Automates ticket triage, workflow routing, and follow-up tasks across enterprise operations teams.",
      category: "Operations",
      company_id: companyId,
      use_cases: [
        {
          title: "Ticket triage",
          description: "Routes operational issues to the right support queue.",
        },
      ],
      functional_categories: ["IT Operations"],
      industry_categories: ["Technology"],
      industries: ["Technology"],
      infrastructure_categories: ["Cloud & Infrastructure"],
      expected_outcomes: ["Faster response times"],
      integrations: ["Slack"],
      source_url: "https://example.com/source",
      demo_url: "https://example.com/demo",
      status: "active",
      search_text: "ops pilot technology it operations slack faster response times",
      created_at: Date.now(),
      updated_at: Date.now(),
    })
  );
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
