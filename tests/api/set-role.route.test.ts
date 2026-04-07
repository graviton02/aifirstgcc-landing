// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, clerkClientMock, fetchQueryMock, updateUserMetadataMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  clerkClientMock: vi.fn(),
  fetchQueryMock: vi.fn(),
  updateUserMetadataMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
  clerkClient: clerkClientMock,
}));

vi.mock("convex/nextjs", () => ({
  fetchQuery: fetchQueryMock,
}));

import { POST } from "@/app/api/set-role/route";

describe("POST /api/set-role", () => {
  beforeEach(() => {
    authMock.mockReset();
    clerkClientMock.mockReset();
    fetchQueryMock.mockReset();
    updateUserMetadataMock.mockReset();

    clerkClientMock.mockResolvedValue({
      users: {
        updateUserMetadata: updateUserMetadataMock,
      },
    });
  });

  it("returns 401 when the request is unauthenticated", async () => {
    authMock.mockRejectedValue(new Error("Unauthorized"));

    const response = await POST();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when Convex cannot be authenticated", async () => {
    const getTokenMock = vi.fn().mockResolvedValue(null);
    authMock.mockResolvedValue({
      userId: "user_123",
      getToken: getTokenMock,
    });

    const response = await POST();

    expect(getTokenMock).toHaveBeenCalledWith({ template: "convex" });
    expect(fetchQueryMock).not.toHaveBeenCalled();
    expect(updateUserMetadataMock).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to authenticate with Convex.",
    });
  });

  it("persists a null cached role when the user has no provider or GCC access", async () => {
    const getTokenMock = vi.fn().mockResolvedValue("convex-token");
    authMock.mockResolvedValue({
      userId: "user_123",
      getToken: getTokenMock,
    });
    fetchQueryMock.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    const response = await POST();

    expect(getTokenMock).toHaveBeenCalledWith({ template: "convex" });
    expect(updateUserMetadataMock).toHaveBeenCalledWith("user_123", {
      publicMetadata: { role: null },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      role: null,
    });
  });

  it("prefers provider access over GCC metadata when both exist", async () => {
    authMock.mockResolvedValue({
      userId: "user_123",
      getToken: vi.fn().mockResolvedValue("convex-token"),
    });
    fetchQueryMock
      .mockResolvedValueOnce({ _id: "company_123" })
      .mockResolvedValueOnce({ _id: "profile_123" });

    const response = await POST();

    expect(updateUserMetadataMock).toHaveBeenCalledWith("user_123", {
      publicMetadata: { role: "provider" },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      role: "provider",
    });
  });

  it("sets the cached GCC role when only GCC access exists", async () => {
    authMock.mockResolvedValue({
      userId: "user_123",
      getToken: vi.fn().mockResolvedValue("convex-token"),
    });
    fetchQueryMock.mockResolvedValueOnce(null).mockResolvedValueOnce({ _id: "profile_123" });

    const response = await POST();

    expect(updateUserMetadataMock).toHaveBeenCalledWith("user_123", {
      publicMetadata: { role: "gcc" },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      role: "gcc",
    });
  });
});
