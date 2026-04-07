import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerReplaceMock = vi.fn();
const useQueryMock = vi.fn();
let mockTab = "";
let mockUserRole = {
  role: "gcc" as "provider" | "gcc" | null,
  isLoaded: true,
  providerSetupStarted: false,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
  usePathname: () => "/gcc-dashboard",
  useSearchParams: () => new URLSearchParams(mockTab ? `tab=${mockTab}` : ""),
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isSignedIn: true, isLoaded: true }),
  useUser: () => ({
    user: {
      firstName: "Fallback",
      fullName: "Fallback User",
      primaryEmailAddress: { emailAddress: "fallback@example.com" },
    },
  }),
}));

vi.mock("@/auth/useUserRole", () => ({
  useUserRole: () => mockUserRole,
}));

vi.mock("@/components/dashboard/DashboardShell", () => ({
  DashboardShell: ({
    activeKey,
    onNavigate,
    children,
    brand,
  }: {
    activeKey: string;
    onNavigate: (key: string) => void;
    children: React.ReactNode;
    brand?: { name?: string };
  }) => (
    <div>
      <div>Active tab: {activeKey}</div>
      <div>Brand: {brand?.name}</div>
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

vi.mock("@/components/gcc-dashboard/ProfileTab", () => ({
  ProfileTab: () => <div>Profile tab</div>,
}));

describe("GCCDashboardPage", () => {
  beforeEach(() => {
    mockTab = "";
    mockUserRole = { role: "gcc", isLoaded: true, providerSetupStarted: false };
    routerReplaceMock.mockReset();
    useQueryMock.mockReset();
    useQueryMock.mockReturnValue({
      name: "Priya Sharma",
      email: "priya@gcc.example",
      organization: "Global Capability Center",
      industry: "Financial Services (BFSI)",
    });
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

  it("renders the profile tab and prefers the GCC profile name for branding", async () => {
    mockTab = "profile";

    const Page = (await import("@/app/gcc-dashboard/page")).default;
    render(<Page />);

    expect(screen.getByText("Active tab: profile")).toBeInTheDocument();
    expect(screen.getByText("Profile tab")).toBeInTheDocument();
    expect(screen.getByText("Brand: Priya Sharma")).toBeInTheDocument();
  });

  it("routes provider-setup-started users into provider setup instead of GCC onboarding", async () => {
    mockUserRole = { role: null, isLoaded: true, providerSetupStarted: true };

    const Page = (await import("@/app/gcc-dashboard/page")).default;
    render(<Page />);

    expect(routerReplaceMock).toHaveBeenCalledWith("/provider/setup");
  });
});
