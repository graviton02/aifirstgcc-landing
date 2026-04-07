import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePendingInviteActivation } from "@/hooks/usePendingInviteActivation";

const useAuthMock = vi.fn();
const useUserMock = vi.fn();
const useMutationMock = vi.fn();
const acceptPendingInviteMock = vi.fn();
const reloadMock = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => useAuthMock(),
  useUser: () => useUserMock(),
}));

vi.mock("convex/react", () => ({
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

function TestComponent() {
  const { isResolving, error } = usePendingInviteActivation();
  return (
    <div>
      <span>{isResolving ? "resolving" : "done"}</span>
      <span>{error || "no-error"}</span>
    </div>
  );
}

describe("usePendingInviteActivation", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useUserMock.mockReset();
    useMutationMock.mockReset();
    acceptPendingInviteMock.mockReset();
    reloadMock.mockReset();

    useAuthMock.mockReturnValue({ isLoaded: true, isSignedIn: true });
    useUserMock.mockReturnValue({
      user: {
        id: "user_123",
        reload: reloadMock,
      },
    });
    useMutationMock.mockReturnValue(acceptPendingInviteMock);
    vi.stubGlobal("fetch", vi.fn());
  });

  it("accepts pending invites and upgrades the user to provider", async () => {
    acceptPendingInviteMock.mockResolvedValue({ status: "accepted", company_id: "company-1" });
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true } as Response);

    render(<TestComponent />);

    await waitFor(() => expect(screen.getByText("done")).toBeInTheDocument());
    expect(acceptPendingInviteMock).toHaveBeenCalledWith({});
    expect(fetch).toHaveBeenCalledWith("/api/set-role", expect.objectContaining({
      method: "POST",
    }));
    expect(reloadMock).toHaveBeenCalled();
  });

  it("surfaces invite conflicts without trying to set the role", async () => {
    acceptPendingInviteMock.mockResolvedValue({
      status: "conflict",
      message: "Multiple pending team invites were found for your email. Contact support to resolve them.",
    });

    render(<TestComponent />);

    await waitFor(() =>
      expect(
        screen.getByText(/multiple pending team invites were found for your email/i)
      ).toBeInTheDocument()
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
  });
});
