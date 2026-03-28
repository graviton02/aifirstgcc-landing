// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  clerkClientMock,
  fetchMutationMock,
  fetchQueryMock,
  getMyProviderCompanyMock,
  deleteOrganizationMembershipMock,
  revokeOrganizationInvitationMock,
  reportErrorMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  clerkClientMock: vi.fn(),
  fetchMutationMock: vi.fn(),
  fetchQueryMock: vi.fn(),
  getMyProviderCompanyMock: vi.fn(),
  deleteOrganizationMembershipMock: vi.fn(),
  revokeOrganizationInvitationMock: vi.fn(),
  reportErrorMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
  clerkClient: clerkClientMock,
}));

vi.mock("convex/nextjs", () => ({
  fetchMutation: fetchMutationMock,
  fetchQuery: fetchQueryMock,
}));

vi.mock("@/lib/provider-organizations", () => ({
  getMyProviderCompany: getMyProviderCompanyMock,
}));

vi.mock("@/lib/report-error", async () => {
  const actual = await vi.importActual<typeof import("@/lib/report-error")>("@/lib/report-error");
  return {
    ...actual,
    reportError: reportErrorMock,
  };
});

import { POST } from "@/app/api/provider-team/remove/route";

describe("POST /api/provider-team/remove", () => {
  beforeEach(() => {
    authMock.mockReset();
    clerkClientMock.mockReset();
    fetchMutationMock.mockReset();
    fetchQueryMock.mockReset();
    getMyProviderCompanyMock.mockReset();
    deleteOrganizationMembershipMock.mockReset();
    revokeOrganizationInvitationMock.mockReset();
    reportErrorMock.mockReset();

    clerkClientMock.mockResolvedValue({
      organizations: {
        deleteOrganizationMembership: deleteOrganizationMembershipMock,
        revokeOrganizationInvitation: revokeOrganizationInvitationMock,
      },
    });
  });

  it("returns 400 when the member id is missing", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });

    const response = await POST(
      new Request("https://orbys360.test/api/provider-team/remove", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Member id is required.",
    });
  });

  it("returns 404 when the provider does not have an active company", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    getMyProviderCompanyMock.mockResolvedValue({
      token: "convex-token",
      company: null,
    });

    const response = await POST(
      new Request("https://orbys360.test/api/provider-team/remove", {
        method: "POST",
        body: JSON.stringify({ memberId: "member_123" }),
      })
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "No active provider company found.",
    });
  });

  it("removes the Clerk membership and then deletes the local company member", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    getMyProviderCompanyMock.mockResolvedValue({
      token: "convex-token",
      company: {
        _id: "company_123",
        clerk_org_id: "org_123",
      },
    });
    fetchQueryMock.mockResolvedValue({
      _id: "member_123",
      user_id: "user_456",
    });
    fetchMutationMock.mockResolvedValue(undefined);

    const response = await POST(
      new Request("https://orbys360.test/api/provider-team/remove", {
        method: "POST",
        body: JSON.stringify({ memberId: "member_123" }),
      })
    );

    expect(deleteOrganizationMembershipMock).toHaveBeenCalledWith({
      organizationId: "org_123",
      userId: "user_456",
    });
    expect(fetchMutationMock).toHaveBeenCalledWith(
      expect.anything(),
      { member_id: "member_123" },
      { token: "convex-token" }
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });

  it("returns the structured Convex error without reporting expected member removal failures", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    getMyProviderCompanyMock.mockResolvedValue({
      token: "convex-token",
      company: {
        _id: "company_123",
        clerk_org_id: "org_123",
      },
    });
    fetchQueryMock.mockResolvedValue({
      _id: "member_123",
      user_id: "user_456",
    });
    fetchMutationMock.mockRejectedValue(
      Object.assign(new Error("Server Error"), {
        data: {
          code: "member_owner_remove",
          message: "Cannot remove the company owner",
          status: 400,
        },
      })
    );

    const response = await POST(
      new Request("https://orbys360.test/api/provider-team/remove", {
        method: "POST",
        body: JSON.stringify({ memberId: "member_123" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Cannot remove the company owner",
    });
    expect(reportErrorMock).not.toHaveBeenCalled();
  });

  it("reports unexpected member removal failures as generic 500 responses", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    getMyProviderCompanyMock.mockResolvedValue({
      token: "convex-token",
      company: {
        _id: "company_123",
        clerk_org_id: "org_123",
      },
    });
    fetchQueryMock.mockResolvedValue({
      _id: "member_123",
      user_id: "user_456",
    });
    fetchMutationMock.mockRejectedValue(new Error("Database unavailable"));

    const response = await POST(
      new Request("https://orbys360.test/api/provider-team/remove", {
        method: "POST",
        body: JSON.stringify({ memberId: "member_123" }),
      })
    );

    expect(reportErrorMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to remove team member.",
    });
  });
});
