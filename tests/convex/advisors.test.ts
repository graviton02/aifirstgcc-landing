import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import { createTestConvex } from "./testHarness";

const VALID_APPLICATION = {
  full_name: "Ada Okafor",
  email: "ada@independent.example",
  linkedin_url: "https://www.linkedin.com/in/ada-okafor",
  headline: "Fractional Head of AI",
  years_experience: "11-15 years",
  expertise_areas: ["AI Strategy", "AI Governance & Risk"],
  bio: "Fifteen years leading applied AI programs across financial services and GCC build-outs, from strategy through delivery.",
  consent: true,
  user_agent: "vitest",
};

describe("advisor application workflows", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    t = createTestConvex();
  });

  it("stores a pending advisor submission", async () => {
    const result = await t.mutation(
      api.advisors.submitAdvisorApplication,
      VALID_APPLICATION
    );

    expect(result.ok).toBe(true);

    const submissions = await t.run((ctx) =>
      ctx.db.query("advisorSubmissions").collect()
    );
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      full_name: "Ada Okafor",
      email: "ada@independent.example",
      linkedin_url: "https://www.linkedin.com/in/ada-okafor",
      headline: "Fractional Head of AI",
      years_experience: "11-15 years",
      expertise_areas: ["AI Strategy", "AI Governance & Risk"],
      consent: true,
      status: "pending",
    });
    expect(submissions[0]?.created_at).toEqual(expect.any(Number));
    expect(submissions[0]?.updated_at).toEqual(expect.any(Number));
  });

  it("accepts personal / free email domains (no free-provider block)", async () => {
    const result = await t.mutation(api.advisors.submitAdvisorApplication, {
      ...VALID_APPLICATION,
      email: "ada.okafor@gmail.com",
    });
    expect(result.ok).toBe(true);

    const submissions = await t.run((ctx) =>
      ctx.db.query("advisorSubmissions").collect()
    );
    expect(submissions[0]?.email).toBe("ada.okafor@gmail.com");
  });

  it("dedupes by email (case-insensitive)", async () => {
    await t.mutation(api.advisors.submitAdvisorApplication, VALID_APPLICATION);

    await expect(
      t.mutation(api.advisors.submitAdvisorApplication, {
        ...VALID_APPLICATION,
        email: "ADA@independent.example",
      })
    ).rejects.toThrow("advisor_already_applied");

    const submissions = await t.run((ctx) =>
      ctx.db.query("advisorSubmissions").collect()
    );
    expect(submissions).toHaveLength(1);
  });

  it("rejects an invalid LinkedIn URL", async () => {
    await expect(
      t.mutation(api.advisors.submitAdvisorApplication, {
        ...VALID_APPLICATION,
        linkedin_url: "not-a-real-linkedin-profile",
      })
    ).rejects.toThrow("advisor_linkedin_invalid");
  });

  it("rejects an invalid email address", async () => {
    await expect(
      t.mutation(api.advisors.submitAdvisorApplication, {
        ...VALID_APPLICATION,
        email: "not-an-email",
      })
    ).rejects.toThrow("advisor_email_invalid");
  });

  it("requires the public-listing consent checkbox", async () => {
    await expect(
      t.mutation(api.advisors.submitAdvisorApplication, {
        ...VALID_APPLICATION,
        consent: false,
      })
    ).rejects.toThrow("advisor_consent_required");
  });

  it("requires at least one recognised expertise area", async () => {
    await expect(
      t.mutation(api.advisors.submitAdvisorApplication, {
        ...VALID_APPLICATION,
        expertise_areas: [],
      })
    ).rejects.toThrow("advisor_expertise_required");

    await expect(
      t.mutation(api.advisors.submitAdvisorApplication, {
        ...VALID_APPLICATION,
        expertise_areas: ["Underwater Basket Weaving"],
      })
    ).rejects.toThrow("advisor_expertise_invalid");
  });
});
