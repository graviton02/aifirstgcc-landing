import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import { createTestConvex } from "./testHarness";

const sharedIdentity = {
  subject: "shared-user-id",
  email: "shared@example.com",
};

describe("single-persona enforcement", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    t = createTestConvex();
  });

  it("blocks provider onboarding for an account that already has a GCC profile", async () => {
    await t.withIdentity(sharedIdentity).mutation(api.gccProfiles.createProfile, {
      name: "Priya Sharma",
      email: "priya@gcc.example",
      organization: "Global Capability Center",
      industry: "Financial Services (BFSI)",
    });

    await expect(
      t.withIdentity(sharedIdentity).mutation(api.providerProfiles.ensureProvider, {})
    ).rejects.toThrow(
      "This account is already set up as a GCC account. Use a different email if you need provider access."
    );
  });

  it("blocks GCC onboarding for an account that already has provider access", async () => {
    await t.withIdentity(sharedIdentity).mutation(api.providerProfiles.ensureProvider, {});

    await expect(
      t.withIdentity(sharedIdentity).mutation(api.gccProfiles.createProfile, {
        name: "Priya Sharma",
        email: "priya@gcc.example",
        organization: "Global Capability Center",
        industry: "Financial Services (BFSI)",
      })
    ).rejects.toThrow(
      "This account is already set up as a provider account. Use a different email if you need GCC access."
    );
  });
});
