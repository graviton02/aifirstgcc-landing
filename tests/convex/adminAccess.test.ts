import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import { createTestConvex } from "./testHarness";

const adminIdentity = {
  subject: "admin-user-id",
  email: "admin@orbys360.com",
};

describe("admin access allowlist", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    delete process.env.ADMIN_CLERK_USER_IDS;
    delete process.env.ADMIN_CLERK_EMAILS;
    t = createTestConvex();
  });

  it("grants admin access when the Clerk user id is allowlisted", async () => {
    process.env.ADMIN_CLERK_USER_IDS = adminIdentity.subject;

    const access = await t.withIdentity(adminIdentity).query(api.admin.getViewerAccess, {});

    expect(access).toEqual({
      isAuthenticated: true,
      isAdmin: true,
      userId: adminIdentity.subject,
    });
  });

  it("grants admin access when the Clerk email is allowlisted", async () => {
    process.env.ADMIN_CLERK_EMAILS = adminIdentity.email;

    const access = await t.withIdentity(adminIdentity).query(api.admin.getViewerAccess, {});

    expect(access).toEqual({
      isAuthenticated: true,
      isAdmin: true,
      userId: adminIdentity.subject,
    });
  });

  it("does not grant admin access to signed-in users outside the allowlist", async () => {
    const access = await t.withIdentity(adminIdentity).query(api.admin.getViewerAccess, {});

    expect(access).toEqual({
      isAuthenticated: true,
      isAdmin: false,
      userId: adminIdentity.subject,
    });
  });
});
