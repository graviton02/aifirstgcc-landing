import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerReplaceMock = vi.fn();
const useQueryMock = vi.fn();
const signOutMock = vi.fn();

let authState = {
  isLoaded: true,
  isSignedIn: true,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => authState,
  useClerk: () => ({ signOut: signOutMock }),
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock("@/components/dashboard/DashboardShell", () => ({
  DashboardShell: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/admin/AdminOverviewTab", () => ({
  AdminOverviewTab: () => <div>Overview</div>,
}));
vi.mock("@/components/admin/AdminClaimsTab", () => ({
  AdminClaimsTab: () => <div>Claims</div>,
}));
vi.mock("@/components/admin/AdminCompanySubmissionsTab", () => ({
  AdminCompanySubmissionsTab: () => <div>New Companies</div>,
}));
vi.mock("@/components/admin/AdminCompanyEditsTab", () => ({
  AdminCompanyEditsTab: () => <div>Company Edits</div>,
}));
vi.mock("@/components/admin/AdminAgentsTab", () => ({
  AdminAgentsTab: () => <div>Agents</div>,
}));
vi.mock("@/components/admin/AdminAllAgentsTab", () => ({
  AdminAllAgentsTab: () => <div>All Agents</div>,
}));
vi.mock("@/components/admin/AdminAgentEditsTab", () => ({
  AdminAgentEditsTab: () => <div>Agent Edits</div>,
}));
vi.mock("@/components/admin/AdminContactRequestsTab", () => ({
  AdminContactRequestsTab: () => <div>Contact Requests</div>,
}));
vi.mock("@/components/admin/AdminReviewsTab", () => ({
  AdminReviewsTab: () => <div>Reviews</div>,
}));

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    authState = { isLoaded: true, isSignedIn: true };
    routerReplaceMock.mockReset();
    useQueryMock.mockReset();
    signOutMock.mockReset();
  });

  it("redirects unauthenticated visitors to the sign-in page", async () => {
    authState = { isLoaded: true, isSignedIn: false };

    const Page = (await import("@/app/admin/page")).default;
    render(<Page />);

    expect(routerReplaceMock).toHaveBeenCalledWith("/sign-in?redirect_url=%2Fadmin");
  });

  it("shows an unauthorized state for signed-in users outside the admin allowlist", async () => {
    useQueryMock.mockImplementation((_query: unknown, args?: unknown) => {
      if (args === "skip") {
        return undefined;
      }

      return {
        isAuthenticated: true,
        isAdmin: false,
        userId: "user_123",
      };
    });

    const Page = (await import("@/app/admin/page")).default;
    render(<Page />);

    expect(screen.getByText("Admin Access Required")).toBeInTheDocument();
    expect(
      screen.getByText(/not allowlisted for the admin workspace/i)
    ).toBeInTheDocument();
  });

  it("renders the admin dashboard for allowlisted users", async () => {
    useQueryMock
      .mockReturnValueOnce({
        isAuthenticated: true,
        isAdmin: true,
        userId: "admin_user_123",
      })
      .mockReturnValueOnce({
        pendingClaims: 2,
        pendingCompanySubmissions: 1,
        pendingCompanyEdits: 0,
        pendingAgentSubmissions: 3,
        pendingAgentEdits: 0,
        pendingContactRequests: 4,
        pendingReviews: 1,
        pendingReviewResponses: 2,
      });

    const Page = (await import("@/app/admin/page")).default;
    render(<Page />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.queryByText("Admin Access Required")).not.toBeInTheDocument();
  });
});
