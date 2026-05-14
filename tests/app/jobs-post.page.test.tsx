import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let mockJobBoardRole: "jobseeker" | "recruiter" | null = "jobseeker";
const replaceMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true }),
}));

vi.mock("@/jobs/useJobBoardRole", () => ({
  useJobBoardRole: () => ({
    profile: { company_name: "Acme" },
    role: mockJobBoardRole,
    isLoaded: true,
    isSignedIn: true,
  }),
}));

vi.mock("@/components/shared/Navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/shared/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/jobs/JobPostForm", () => ({
  JobPostForm: () => <div>JobPostForm</div>,
}));

beforeEach(() => {
  mockJobBoardRole = "jobseeker";
  replaceMock.mockReset();
});

afterEach(() => cleanup());

describe("/jobs/post page", () => {
  it("shows a friendly block when the user is a jobseeker", async () => {
    const Page = (await import("@/app/jobs/post/page")).default;
    render(<Page />);

    expect(screen.getByText(/Only recruiter accounts can post jobs/i)).toBeInTheDocument();
    expect(screen.queryByText("JobPostForm")).not.toBeInTheDocument();
  });

  it("renders the post form when the user is a recruiter", async () => {
    mockJobBoardRole = "recruiter";
    const Page = (await import("@/app/jobs/post/page")).default;
    render(<Page />);

    expect(screen.getByText("JobPostForm")).toBeInTheDocument();
  });

  it("redirects null-role signed-in users to onboarding with recruiter intent", async () => {
    mockJobBoardRole = null;
    const Page = (await import("@/app/jobs/post/page")).default;
    render(<Page />);

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith(
        "/jobs/onboarding?role=recruiter&returnUrl=%2Fjobs%2Fpost"
      )
    );
  });
});
