import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import { createTestConvex } from "./testHarness";

const claimOwnerIdentity = {
  subject: "claim-owner-id",
  email: "asha@acme.example",
};
const otherIdentity = {
  subject: "other-user-id",
  email: "other@acme.example",
};
const gccIdentity = {
  subject: "gcc-user-id",
  email: "asha@acme.example",
};

describe("claim workflows", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    t = createTestConvex();
  });

  it("stores the required LinkedIn URL on new claim requests", async () => {
    const companyId = await seedCompany(t);

    const claimId = await t.mutation(api.claims.submitClaim, {
      company_id: companyId,
      claimant_name: "Asha Singh",
      claimant_email: "asha@acme.example",
      claimant_linkedin: "https://www.linkedin.com/in/asha-singh",
    });

    const claim = await t.run((ctx) => ctx.db.get(claimId));
    const company = await t.run((ctx) => ctx.db.get(companyId));

    expect(claim).toMatchObject({
      claimant_name: "Asha Singh",
      claimant_email: "asha@acme.example",
      claimant_linkedin: "https://www.linkedin.com/in/asha-singh",
      status: "pending",
    });
    expect(company?.claim_status).toBe("pending");
  });

  it("rejects missing or invalid LinkedIn profile URLs", async () => {
    const companyId = await seedCompany(t);

    await expect(
      t.mutation(api.claims.submitClaim, {
        company_id: companyId,
        claimant_name: "Asha Singh",
        claimant_email: "asha@acme.example",
        claimant_linkedin: "",
      })
    ).rejects.toThrow("Please enter a valid LinkedIn profile URL.");

    await expect(
      t.mutation(api.claims.submitClaim, {
        company_id: companyId,
        claimant_name: "Asha Singh",
        claimant_email: "asha@acme.example",
        claimant_linkedin: "https://www.linkedin.com/company/acme",
      })
    ).rejects.toThrow("Please enter a valid LinkedIn profile URL.");
  });

  it("does not expose claimant identity when validating an activation link", async () => {
    const { token } = await seedApprovedClaim(t);

    const result = await t.query(api.claims.validateMagicLink, { token });

    expect(result).toMatchObject({
      valid: true,
      company_name: "Acme AI",
    });
    expect(result).not.toHaveProperty("claimant_email");
    expect(result).not.toHaveProperty("claimant_name");
  });

  it("rejects claim activation for unauthenticated visitors", async () => {
    const { token } = await seedApprovedClaim(t);

    await expect(t.mutation(api.claims.activateClaim, { token })).rejects.toThrow(
      "Unauthenticated"
    );
  });

  it("rejects claim activation when the signed-in email does not match the claim email", async () => {
    const { token } = await seedApprovedClaim(t);

    await expect(
      t.withIdentity(otherIdentity).mutation(api.claims.activateClaim, { token })
    ).rejects.toThrow(
      "Sign in with the same company email that submitted this claim before activating it."
    );
  });

  it("rejects claim activation for GCC accounts even when the email matches", async () => {
    const { token } = await seedApprovedClaim(t);
    await t.withIdentity(gccIdentity).mutation(api.gccProfiles.createProfile, {
      name: "Asha Singh",
      email: gccIdentity.email,
      organization: "Global Capability Center",
      industry: "Technology",
    });

    await expect(
      t.withIdentity(gccIdentity).mutation(api.claims.activateClaim, { token })
    ).rejects.toThrow(
      "This account is already set up as a GCC account. Use a different email if you need provider access."
    );
  });

  it("activates a claim only for the matching claimant identity", async () => {
    const { companyId, token } = await seedApprovedClaim(t);

    const result = await t
      .withIdentity(claimOwnerIdentity)
      .mutation(api.claims.activateClaim, { token });

    expect(result).toEqual({ success: true });

    const company = await t.run((ctx) => ctx.db.get(companyId));
    expect(company).toMatchObject({
      claim_status: "claimed",
      claimed_by_user_id: claimOwnerIdentity.subject,
    });
  });
});

async function seedCompany(t: ReturnType<typeof createTestConvex>) {
  const now = Date.now();

  return await t.run((ctx) =>
    ctx.db.insert("companies", {
      slug: "acme-ai",
      name: "Acme AI",
      description: "Builds AI systems for enterprise teams.",
      website: "https://acme.example.com",
      headquarters: "Bengaluru, India",
      primary_verticals: ["Technology"],
      verification_status: "verified",
      claim_status: "unclaimed",
      created_at: now,
      updated_at: now,
    })
  );
}

async function seedApprovedClaim(t: ReturnType<typeof createTestConvex>) {
  const companyId = await seedCompany(t);
  const now = Date.now();
  const token = "claim-token-123";

  await t.run((ctx) =>
    ctx.db.insert("claimRequests", {
      company_id: companyId,
      claimant_name: "Asha Singh",
      claimant_email: claimOwnerIdentity.email,
      claimant_linkedin: "https://www.linkedin.com/in/asha-singh",
      status: "approved",
      magic_link_token: token,
      magic_link_expires_at: now + 60_000,
      created_at: now,
      reviewed_at: now,
    })
  );

  return { companyId, token };
}
