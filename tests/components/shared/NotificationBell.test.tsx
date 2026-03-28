import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
const pushMock = vi.fn();
const markReadMock = vi.fn();
const markAllReadMock = vi.fn();
const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
let notificationsValue: unknown[] | undefined = undefined;
let unreadCountValue: number | undefined = undefined;
let mutationCallIndex = 0;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

describe("NotificationBell", () => {
  beforeEach(() => {
    pushMock.mockReset();
    markReadMock.mockReset();
    markAllReadMock.mockReset();
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    mutationCallIndex = 0;

    notificationsValue = [
      {
        _id: "notification-1",
        title: "Agent submission approved",
        body: "Your agent is now live.",
        link: "/dashboard?tab=agents",
        created_at: Date.now(),
      },
    ];
    unreadCountValue = 120;

    useQueryMock.mockImplementation((_query, args) => {
      if (args && typeof args === "object" && "limit" in (args as Record<string, unknown>)) {
        return notificationsValue;
      }
      return unreadCountValue;
    });

    useMutationMock.mockImplementation(() => {
      mutationCallIndex += 1;
      if (mutationCallIndex % 2 === 1) {
        return markReadMock;
      }
      return markAllReadMock;
    });
  });

  it("renders a capped unread badge and marks a notification read before navigating", async () => {
    const { NotificationBell } = await import("@/components/shared/NotificationBell");

    render(<NotificationBell role="provider" isScrolled />);

    expect(screen.getByText("99+")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open notifications/i }));
    await screen.findByText(/provider notifications/i);
    fireEvent.click(screen.getByRole("button", { name: /agent submission approved/i }));

    await waitFor(() =>
      expect(markReadMock).toHaveBeenCalledWith({
        notification_id: "notification-1",
      })
    );
    expect(pushMock).toHaveBeenCalledWith("/dashboard?tab=agents");
  });

  it("renders the empty state and mark-all control", async () => {
    notificationsValue = [];
    unreadCountValue = 0;

    const { NotificationBell } = await import("@/components/shared/NotificationBell");

    render(<NotificationBell role="gcc" isScrolled />);

    fireEvent.click(screen.getByRole("button", { name: /open notifications/i }));
    await screen.findByText(/gcc notifications/i);
    expect(screen.getByText(/no notifications yet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark all as read/i })).toBeDisabled();
  });

  it("marks all notifications as read", async () => {
    const { NotificationBell } = await import("@/components/shared/NotificationBell");

    render(<NotificationBell role="provider" isScrolled />);

    fireEvent.click(screen.getByRole("button", { name: /open notifications/i }));
    await screen.findByText(/provider notifications/i);
    fireEvent.click(screen.getByRole("button", { name: /mark all as read/i }));

    await waitFor(() => expect(markAllReadMock).toHaveBeenCalledWith({}));
  });
});
