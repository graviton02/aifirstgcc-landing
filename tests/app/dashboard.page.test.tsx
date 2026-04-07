import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerReplaceMock = vi.fn();
const useQueryMock = vi.fn();
let mockTab = "";
let mockUserRole = {
  role: "provider" as "provider" | "gcc" | null,
  isLoaded: true,
  providerSetupStarted: false,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(mockTab ? `tab=${mockTab}` : ""),
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock("@/auth/useUserRole", () => ({
  useUserRole: () => mockUserRole,
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
      <button onClick={() => onNavigate("team")}>Go team</button>
      {children}
    </div>
  ),
}));

vi.mock("@/components/dashboard/ProfileTab", () => ({
  ProfileTab: () => <div>Profile tab</div>,
}));

vi.mock("@/components/dashboard/AgentsTab", () => ({
  AgentsTab: ({ companyId }: { companyId: string }) => <div>Agents tab for {companyId}</div>,
}));

vi.mock("@/components/dashboard/TeamTab", () => ({
  TeamTab: ({ companyId }: { companyId: string }) => <div>Team tab for {companyId}</div>,
}));

describe("ProviderDashboardPage", () => {
  beforeEach(() => {
    mockTab = "";
    mockUserRole = { role: "provider", isLoaded: true, providerSetupStarted: false };
    routerReplaceMock.mockReset();
    useQueryMock.mockReset();
    useQueryMock.mockReturnValue({
      _id: "company-1",
      membership_role: "owner",
    });
  });

  it("uses the agents tab from the query string", async () => {
    mockTab = "agents";

    const Page = (await import("@/app/dashboard/page")).default;
    render(<Page />);

    expect(screen.getByText("Active tab: agents")).toBeInTheDocument();
    expect(screen.getByText("Agents tab for company-1")).toBeInTheDocument();
  });

  it("falls back to the default tab for invalid values", async () => {
    mockTab = "invalid";

    const Page = (await import("@/app/dashboard/page")).default;
    render(<Page />);

    expect(screen.getByText("Active tab: profile")).toBeInTheDocument();
    expect(screen.getByText("Profile tab")).toBeInTheDocument();
  });

  it("updates the URL query string when navigating tabs", async () => {
    const Page = (await import("@/app/dashboard/page")).default;
    render(<Page />);

    fireEvent.click(screen.getByRole("button", { name: /go team/i }));

    expect(routerReplaceMock).toHaveBeenCalledWith("/dashboard?tab=team");
  });

  it("routes provider-setup-started users back into setup until provider access is active", async () => {
    mockUserRole = { role: null, isLoaded: true, providerSetupStarted: true };
    useQueryMock.mockReturnValue(null);

    const Page = (await import("@/app/dashboard/page")).default;
    render(<Page />);

    expect(routerReplaceMock).toHaveBeenCalledWith("/provider/setup");
  });
});
