// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  clerkClientMock,
  fetchQueryMock,
  getOrganizationMembershipListMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  clerkClientMock: vi.fn(),
  fetchQueryMock: vi.fn(),
  getOrganizationMembershipListMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
  clerkClient: clerkClientMock,
}));

vi.mock("convex/nextjs", () => ({
  fetchQuery: fetchQueryMock,
}));

import { POST } from "@/app/api/provider-org/sync/route";

describe("POST /api/provider-org/sync", () => {
  beforeEach(() => {
    authMock.mockReset();
    clerkClientMock.mockReset();
    fetchQueryMock.mockReset();
    getOrganizationMembershipListMock.mockReset();

    clerkClientMock.mockResolvedValue({
      users: {
        getOrganizationMembershipList: getOrganizationMembershipListMock,
      },
    });
  });

  it("returns 401 when no authenticated user is present", async () => {
    authMock.mockResolvedValue({
      userId: null,
      getToken: vi.fn(),
    });

    const response = await POST();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns linked membership diagnostics without mutating local access", async () => {
    authMock.mockResolvedValue({
      userId: "user_123",
      getToken: vi.fn(),
    });
    getOrganizationMembershipListMock.mockResolvedValue({
      data: [
        {
          organization: { id: "org_123" },
          role: "org:admin",
        },
      ],
    });
    fetchQueryMock.mockResolvedValue({
      _id: "company_123",
      slug: "acme-ai",
    });

    const response = await POST();

    expect(fetchQueryMock).toHaveBeenCalledWith(expect.anything(), {
      clerk_org_id: "org_123",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      synced_count: 0,
      memberships: [
        {
          clerk_org_id: "org_123",
          clerk_role: "org:admin",
          company_id: "company_123",
          company_slug: "acme-ai",
        },
      ],
    });
  });

  it("returns a generic inspection error when membership lookup fails", async () => {
    authMock.mockResolvedValue({
      userId: "user_123",
      getToken: vi.fn(),
    });
    getOrganizationMembershipListMock.mockResolvedValue({
      data: [
        {
          organization: { id: "org_123" },
          role: "org:admin",
        },
      ],
    });
    fetchQueryMock.mockRejectedValue(new Error("lookup failed"));

    const response = await POST();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to inspect provider organization memberships.",
    });
  });
});
