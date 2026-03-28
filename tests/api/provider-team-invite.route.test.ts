// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  clerkClientMock,
  fetchMutationMock,
  ensureProviderOrganizationMock,
  createOrganizationInvitationMock,
  reportErrorMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  clerkClientMock: vi.fn(),
  fetchMutationMock: vi.fn(),
  ensureProviderOrganizationMock: vi.fn(),
  createOrganizationInvitationMock: vi.fn(),
  reportErrorMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
  clerkClient: clerkClientMock,
}));

vi.mock("convex/nextjs", () => ({
  fetchMutation: fetchMutationMock,
}));

vi.mock("@/lib/provider-organizations", () => ({
  ensureProviderOrganization: ensureProviderOrganizationMock,
}));

vi.mock("@/lib/report-error", async () => {
  const actual = await vi.importActual<typeof import("@/lib/report-error")>("@/lib/report-error");
  return {
    ...actual,
    reportError: reportErrorMock,
  };
});

import { POST } from "@/app/api/provider-team/invite/route";

describe("POST /api/provider-team/invite", () => {
  beforeEach(() => {
    authMock.mockReset();
    clerkClientMock.mockReset();
    fetchMutationMock.mockReset();
    ensureProviderOrganizationMock.mockReset();
    createOrganizationInvitationMock.mockReset();
    reportErrorMock.mockReset();

    clerkClientMock.mockResolvedValue({
      organizations: {
        createOrganizationInvitation: createOrganizationInvitationMock,
      },
    });
  });

  it("returns 400 when the invite email is invalid", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });

    const response = await POST(
      new Request("https://orbys360.test/api/provider-team/invite", {
        method: "POST",
        body: JSON.stringify({ email: "not-an-email" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "A valid email is required.",
    });
  });

  it("returns 403 when the current provider is not the company owner", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    ensureProviderOrganizationMock.mockResolvedValue({
      token: "convex-token",
      clerkOrgId: "org_123",
      company: {
        _id: "company_123",
        slug: "acme-systems",
        membership_role: "member",
      },
    });

    const response = await POST(
      new Request("https://orbys360.test/api/provider-team/invite", {
        method: "POST",
        body: JSON.stringify({ email: "new.user@example.com" }),
      })
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Only company owners can invite team members.",
    });
  });

  it("creates the Convex member first and then sends the Clerk invitation", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    ensureProviderOrganizationMock.mockResolvedValue({
      token: "convex-token",
      clerkOrgId: "org_123",
      company: {
        _id: "company_123",
        slug: "acme-systems",
        membership_role: "owner",
      },
    });
    fetchMutationMock
      .mockResolvedValueOnce("member_123")
      .mockResolvedValueOnce(undefined);
    createOrganizationInvitationMock.mockResolvedValue({
      id: "invite_123",
      url: "https://clerk.test/invite",
      expiresAt: 1_720_000_000_000,
    });

    const response = await POST(
      new Request("https://orbys360.test/api/provider-team/invite", {
        method: "POST",
        body: JSON.stringify({ email: "New.User@Example.com" }),
      })
    );

    expect(fetchMutationMock).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      {
        company_id: "company_123",
        email: "new.user@example.com",
      },
      { token: "convex-token" }
    );
    expect(createOrganizationInvitationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_123",
        emailAddress: "new.user@example.com",
        inviterUserId: "user_123",
      })
    );
    expect(fetchMutationMock).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.objectContaining({
        member_id: "member_123",
        clerk_invitation_id: "invite_123",
      }),
      { token: "convex-token" }
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });

  it("returns the structured Convex error without reporting expected invite conflicts", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    ensureProviderOrganizationMock.mockResolvedValue({
      token: "convex-token",
      clerkOrgId: "org_123",
      company: {
        _id: "company_123",
        slug: "acme-systems",
        membership_role: "owner",
      },
    });
    fetchMutationMock.mockRejectedValue(
      Object.assign(new Error("Server Error"), {
        data: {
          code: "invite_member_pending",
          message: "An invite is already pending for that email",
          status: 400,
        },
      })
    );

    const response = await POST(
      new Request("https://orbys360.test/api/provider-team/invite", {
        method: "POST",
        body: JSON.stringify({ email: "new.user@example.com" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "An invite is already pending for that email",
    });
    expect(reportErrorMock).not.toHaveBeenCalled();
  });

  it("rolls back the local member and reports unexpected invitation failures", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    ensureProviderOrganizationMock.mockResolvedValue({
      token: "convex-token",
      clerkOrgId: "org_123",
      company: {
        _id: "company_123",
        slug: "acme-systems",
        membership_role: "owner",
      },
    });
    fetchMutationMock
      .mockResolvedValueOnce("member_123")
      .mockResolvedValueOnce(undefined);
    createOrganizationInvitationMock.mockRejectedValue(new Error("Clerk unavailable"));

    const response = await POST(
      new Request("https://orbys360.test/api/provider-team/invite", {
        method: "POST",
        body: JSON.stringify({ email: "new.user@example.com" }),
      })
    );

    expect(fetchMutationMock).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      { member_id: "member_123" },
      { token: "convex-token" }
    );
    expect(reportErrorMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to send team invite.",
    });
  });
});
