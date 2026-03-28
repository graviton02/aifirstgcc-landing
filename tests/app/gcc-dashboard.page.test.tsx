import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerReplaceMock = vi.fn();
let mockTab = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
  usePathname: () => "/gcc-dashboard",
  useSearchParams: () => new URLSearchParams(mockTab ? `tab=${mockTab}` : ""),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isSignedIn: true, isLoaded: true }),
}));

vi.mock("@/auth/useUserRole", () => ({
  useUserRole: () => ({ role: "gcc", isLoaded: true }),
}));

vi.mock("@/components/dashboard/DashboardShell", () => ({
  DashboardShell: ({
    activeKey,
    onNavigate,
    children,
  }: {
    activeKey: string;
    onNavigate: (key: string) => void;
    children: React.ReactNode;
  }) => (
    <div>
      <div>Active tab: {activeKey}</div>
      <button onClick={() => onNavigate("current-requests")}>Go requests</button>
      {children}
    </div>
  ),
}));

vi.mock("@/components/gcc-dashboard/ShortlistedAgentsTab", () => ({
  ShortlistedAgentsTab: () => <div>Shortlisted tab</div>,
}));

vi.mock("@/components/gcc-dashboard/CurrentRequestsTab", () => ({
  CurrentRequestsTab: () => <div>Requests tab</div>,
}));

describe("GCCDashboardPage", () => {
  beforeEach(() => {
    mockTab = "";
    routerReplaceMock.mockReset();
  });

  it("uses the current requests tab from the query string", async () => {
    mockTab = "current-requests";

    const Page = (await import("@/app/gcc-dashboard/page")).default;
    render(<Page />);

    expect(screen.getByText("Active tab: current-requests")).toBeInTheDocument();
    expect(screen.getByText("Requests tab")).toBeInTheDocument();
  });

  it("falls back to the default tab for invalid values", async () => {
    mockTab = "unknown";

    const Page = (await import("@/app/gcc-dashboard/page")).default;
    render(<Page />);

    expect(screen.getByText("Active tab: shortlisted-agents")).toBeInTheDocument();
    expect(screen.getByText("Shortlisted tab")).toBeInTheDocument();
  });

  it("updates the URL query string when navigating tabs", async () => {
    const Page = (await import("@/app/gcc-dashboard/page")).default;
    render(<Page />);

    fireEvent.click(screen.getByRole("button", { name: /go requests/i }));

    expect(routerReplaceMock).toHaveBeenCalledWith("/gcc-dashboard?tab=current-requests");
  });
});
