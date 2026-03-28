// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, clerkClientMock, updateUserMetadataMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  clerkClientMock: vi.fn(),
  updateUserMetadataMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
  clerkClient: clerkClientMock,
}));

import { POST } from "@/app/api/set-role/route";

describe("POST /api/set-role", () => {
  beforeEach(() => {
    authMock.mockReset();
    clerkClientMock.mockReset();
    updateUserMetadataMock.mockReset();

    clerkClientMock.mockResolvedValue({
      users: {
        updateUserMetadata: updateUserMetadataMock,
      },
    });
  });

  it("returns 401 when the request is unauthenticated", async () => {
    authMock.mockRejectedValue(new Error("Unauthorized"));

    const response = await POST(
      new Request("http://localhost/api/set-role", {
        method: "POST",
        body: JSON.stringify({ role: "provider" }),
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns 400 for invalid roles", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });

    const response = await POST(
      new Request("http://localhost/api/set-role", {
        method: "POST",
        body: JSON.stringify({ role: "admin" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid role. Must be one of: gcc, provider",
    });
  });

  it("persists the selected role in Clerk user metadata", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });

    const response = await POST(
      new Request("http://localhost/api/set-role", {
        method: "POST",
        body: JSON.stringify({ role: "provider" }),
      })
    );

    expect(updateUserMetadataMock).toHaveBeenCalledWith("user_123", {
      publicMetadata: { role: "provider" },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      role: "provider",
    });
  });
});
