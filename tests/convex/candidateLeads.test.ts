import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import { createTestConvex } from "./testHarness";

const VALID_LEAD = {
  full_name: "Ravi Menon",
  email: "ravi.menon@example.com",
  current_title: "Senior ML Engineer",
  years_experience: "6-10",
  job_category: "ai-ml",
  profile_url: "https://www.linkedin.com/in/ravi-menon",
  source: "linkedin",
  user_agent: "vitest",
};

const adminIdentity = {
  subject: "admin-user-id",
  email: "admin@orbys360.com",
};

describe("candidate lead capture", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    delete process.env.ADMIN_CLERK_USER_IDS;
    delete process.env.ADMIN_CLERK_EMAILS;
    t = createTestConvex();
  });

  it("stores a new lead and reports it as a first-time registration", async () => {
    const result = await t.mutation(
      api.candidateLeads.submitCandidateLead,
      VALID_LEAD
    );

    expect(result).toEqual({ ok: true, alreadyRegistered: false });

    const leads = await t.run((ctx) => ctx.db.query("candidateLeads").collect());
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({
      full_name: "Ravi Menon",
      email: "ravi.menon@example.com",
      current_title: "Senior ML Engineer",
      years_experience: "6-10",
      job_category: "ai-ml",
      profile_url: "https://www.linkedin.com/in/ravi-menon",
      source: "linkedin",
      status: "new",
    });
    expect(leads[0]?.created_at).toEqual(expect.any(Number));
    expect(leads[0]?.updated_at).toEqual(expect.any(Number));
  });

  it("normalises the email before storing it", async () => {
    await t.mutation(api.candidateLeads.submitCandidateLead, {
      ...VALID_LEAD,
      email: "  Ravi.Menon@Example.COM  ",
    });

    const leads = await t.run((ctx) => ctx.db.query("candidateLeads").collect());
    expect(leads[0]?.email).toBe("ravi.menon@example.com");
  });

  it("accepts a lead without a profile URL", async () => {
    const result = await t.mutation(api.candidateLeads.submitCandidateLead, {
      ...VALID_LEAD,
      profile_url: "",
    });

    expect(result.ok).toBe(true);
    const leads = await t.run((ctx) => ctx.db.query("candidateLeads").collect());
    expect(leads[0]?.profile_url).toBeUndefined();
  });

  it("defaults the source when none is provided", async () => {
    await t.mutation(api.candidateLeads.submitCandidateLead, {
      ...VALID_LEAD,
      source: undefined,
    });

    const leads = await t.run((ctx) => ctx.db.query("candidateLeads").collect());
    expect(leads[0]?.source).toBe("jobs-page");
  });

  it("treats a duplicate email as already registered instead of erroring", async () => {
    await t.mutation(api.candidateLeads.submitCandidateLead, VALID_LEAD);

    const result = await t.mutation(api.candidateLeads.submitCandidateLead, {
      ...VALID_LEAD,
      email: "RAVI.MENON@example.com",
      current_title: "Staff ML Engineer",
    });

    expect(result).toEqual({ ok: true, alreadyRegistered: true });

    const leads = await t.run((ctx) => ctx.db.query("candidateLeads").collect());
    expect(leads).toHaveLength(1);
    expect(leads[0]?.current_title).toBe("Senior ML Engineer");
  });

  it("rejects a name that is too short", async () => {
    await expect(
      t.mutation(api.candidateLeads.submitCandidateLead, {
        ...VALID_LEAD,
        full_name: "R",
      })
    ).rejects.toThrow("candidate_name_short");
  });

  it("rejects an invalid email address", async () => {
    await expect(
      t.mutation(api.candidateLeads.submitCandidateLead, {
        ...VALID_LEAD,
        email: "not-an-email",
      })
    ).rejects.toThrow("candidate_email_invalid");
  });

  it("requires a current title", async () => {
    await expect(
      t.mutation(api.candidateLeads.submitCandidateLead, {
        ...VALID_LEAD,
        current_title: " ",
      })
    ).rejects.toThrow("candidate_title_required");
  });

  it("rejects an unrecognised experience level", async () => {
    await expect(
      t.mutation(api.candidateLeads.submitCandidateLead, {
        ...VALID_LEAD,
        years_experience: "a very long time",
      })
    ).rejects.toThrow("candidate_experience_invalid");
  });

  it("rejects an unrecognised job category", async () => {
    await expect(
      t.mutation(api.candidateLeads.submitCandidateLead, {
        ...VALID_LEAD,
        job_category: "underwater-basket-weaving",
      })
    ).rejects.toThrow("candidate_category_invalid");
  });

  it("rejects a profile URL that is not an http(s) link", async () => {
    await expect(
      t.mutation(api.candidateLeads.submitCandidateLead, {
        ...VALID_LEAD,
        profile_url: "javascript:alert(1)",
      })
    ).rejects.toThrow("candidate_profile_url_invalid");
  });
});

describe("candidate lead admin surface", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    delete process.env.ADMIN_CLERK_USER_IDS;
    delete process.env.ADMIN_CLERK_EMAILS;
    t = createTestConvex();
  });

  it("lists leads newest-first for an admin", async () => {
    await t.mutation(api.candidateLeads.submitCandidateLead, VALID_LEAD);
    await t.mutation(api.candidateLeads.submitCandidateLead, {
      ...VALID_LEAD,
      full_name: "Priya Nair",
      email: "priya@example.com",
    });

    process.env.ADMIN_CLERK_USER_IDS = adminIdentity.subject;
    const leads = await t
      .withIdentity(adminIdentity)
      .query(api.admin.getCandidateLeads, {});

    expect(leads).toHaveLength(2);
    expect(leads[0].created_at).toBeGreaterThanOrEqual(leads[1].created_at);
  });

  it("denies lead listing to non-admins", async () => {
    await expect(
      t.withIdentity({ subject: "regular-user" }).query(api.admin.getCandidateLeads, {})
    ).rejects.toThrow("forbidden_admin");

    await expect(t.query(api.admin.getCandidateLeads, {})).rejects.toThrow(
      "unauthenticated"
    );
  });

  it("updates a lead status for an admin", async () => {
    await t.mutation(api.candidateLeads.submitCandidateLead, VALID_LEAD);
    const [lead] = await t.run((ctx) => ctx.db.query("candidateLeads").collect());

    process.env.ADMIN_CLERK_USER_IDS = adminIdentity.subject;
    await t.withIdentity(adminIdentity).mutation(api.admin.updateCandidateLeadStatus, {
      lead_id: lead._id,
      status: "contacted",
    });

    const updated = await t.run((ctx) => ctx.db.get(lead._id));
    expect(updated?.status).toBe("contacted");
    expect(updated?.updated_at).toBeGreaterThanOrEqual(lead.updated_at);
  });

  it("rejects an unrecognised lead status", async () => {
    await t.mutation(api.candidateLeads.submitCandidateLead, VALID_LEAD);
    const [lead] = await t.run((ctx) => ctx.db.query("candidateLeads").collect());

    process.env.ADMIN_CLERK_USER_IDS = adminIdentity.subject;
    await expect(
      t.withIdentity(adminIdentity).mutation(api.admin.updateCandidateLeadStatus, {
        lead_id: lead._id,
        status: "ghosted",
      })
    ).rejects.toThrow("candidate_status_invalid");
  });

  it("denies status updates to non-admins", async () => {
    await t.mutation(api.candidateLeads.submitCandidateLead, VALID_LEAD);
    const [lead] = await t.run((ctx) => ctx.db.query("candidateLeads").collect());

    await expect(
      t.withIdentity({ subject: "regular-user" }).mutation(
        api.admin.updateCandidateLeadStatus,
        { lead_id: lead._id, status: "contacted" }
      )
    ).rejects.toThrow("forbidden_admin");
  });
});
