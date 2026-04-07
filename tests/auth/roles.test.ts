import { describe, expect, it } from "vitest";
import { canSelectRole, resolveUserRole } from "@/auth/roles";

describe("resolveUserRole", () => {
  it("prefers provider metadata when provider access is real", () => {
    expect(
      resolveUserRole({
        metadataRole: "provider",
        hasProviderAccess: true,
        hasGccProfile: true,
      })
    ).toBe("provider");
  });

  it("ignores stale provider metadata when no provider access exists", () => {
    expect(
      resolveUserRole({
        metadataRole: "provider",
        hasProviderAccess: false,
        hasGccProfile: true,
      })
    ).toBe("gcc");
  });

  it("falls back to null when no eligible role exists", () => {
    expect(
      resolveUserRole({
        metadataRole: "gcc",
        hasProviderAccess: false,
        hasGccProfile: false,
      })
    ).toBeNull();
  });
});

describe("canSelectRole", () => {
  it("only allows provider selection after provider access exists", () => {
    expect(
      canSelectRole("provider", {
        hasProviderAccess: true,
        hasGccProfile: false,
      })
    ).toBe(true);
    expect(
      canSelectRole("provider", {
        hasProviderAccess: false,
        hasGccProfile: false,
      })
    ).toBe(false);
  });

  it("only allows gcc selection after gcc onboarding exists", () => {
    expect(
      canSelectRole("gcc", {
        hasProviderAccess: false,
        hasGccProfile: true,
      })
    ).toBe(true);
    expect(
      canSelectRole("gcc", {
        hasProviderAccess: true,
        hasGccProfile: false,
      })
    ).toBe(false);
  });
});
