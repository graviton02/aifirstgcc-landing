// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  clerkClientMock,
  fetchMutationMock,
  getOrganizationMembershipListMock,
  updateUserMetadataMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  clerkClientMock: vi.fn(),
  fetchMutationMock: vi.fn(),
  getOrganizationMembershipListMock: vi.fn(),
  updateUserMetadataMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
  clerkClient: clerkClientMock,
}));

vi.mock("convex/nextjs", () => ({
  fetchMutation: fetchMutationMock,
}));

import { POST } from "@/app/api/provider-org/sync/route";

describe("POST /api/provider-org/sync", () => {
  beforeEach(() => {
    authMock.mockReset();
    clerkClientMock.mockReset();
    fetchMutationMock.mockReset();
    getOrganizationMembershipListMock.mockReset();
    updateUserMetadataMock.mockReset();

    clerkClientMock.mockResolvedValue({
      users: {
        getOrganizationMembershipList: getOrganizationMembershipListMock,
        updateUserMetadata: updateUserMetadataMock,
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

  it("syncs Clerk memberships into Convex and upgrades the user role when memberships are found", async () => {
    authMock.mockResolvedValue({
      userId: "user_123",
      getToken: vi.fn().mockResolvedValue("convex-token"),
    });
    getOrganizationMembershipListMock.mockResolvedValue({
      data: [
        {
          organization: { id: "org_123" },
          role: "org:admin",
        },
      ],
    });
    fetchMutationMock.mockResolvedValue({ synced_count: 1 });

    const response = await POST();

    expect(fetchMutationMock).toHaveBeenCalledWith(
      expect.anything(),
      {
        memberships: [{ clerk_org_id: "org_123", role: "org:admin" }],
      },
      { token: "convex-token" }
    );
    expect(updateUserMetadataMock).toHaveBeenCalledWith("user_123", {
      publicMetadata: { role: "provider" },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ synced_count: 1 });
  });
});
