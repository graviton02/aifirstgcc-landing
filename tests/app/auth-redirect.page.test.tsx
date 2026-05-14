import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replaceMock = vi.fn();
let mockUserRole: {
  role: "gcc" | "provider" | null;
  isLoaded: boolean;
  providerSetupStarted: boolean;
} = {
  role: null,
  isLoaded: true,
  providerSetupStarted: false,
};
let mockJobBoardRole: "jobseeker" | "recruiter" | null = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/auth/useUserRole", () => ({
  useUserRole: () => mockUserRole,
}));

vi.mock("@/jobs/useJobBoardRole", () => ({
  useJobBoardRole: () => ({ role: mockJobBoardRole, isLoaded: true }),
}));

vi.mock("@/hooks/usePendingInviteActivation", () => ({
  usePendingInviteActivation: () => ({ isResolving: false }),
}));

vi.mock("convex/react", () => ({
  useQuery: () => null,
}));

beforeEach(() => {
  replaceMock.mockReset();
  mockUserRole = { role: null, isLoaded: true, providerSetupStarted: false };
  mockJobBoardRole = null;
});

describe("/auth-redirect", () => {
  it("routes job-board-only users to the job dashboard", async () => {
    mockJobBoardRole = "jobseeker";
    const Page = (await import("@/app/auth-redirect/page")).default;
    render(<Page />);

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/jobs/dashboard")
    );
  });

  it("keeps marketplace routing ahead of job-board routing", async () => {
    mockUserRole = { role: "gcc", isLoaded: true, providerSetupStarted: false };
    mockJobBoardRole = "jobseeker";
    const Page = (await import("@/app/auth-redirect/page")).default;
    render(<Page />);

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/gcc-dashboard"));
  });

  it("falls back to marketplace onboarding when no role exists", async () => {
    const Page = (await import("@/app/auth-redirect/page")).default;
    render(<Page />);

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/onboarding"));
  });
});
