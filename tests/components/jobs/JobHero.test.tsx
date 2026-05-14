import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let mockJobBoardRole: "jobseeker" | "recruiter" | null = null;
let mockIsSignedIn = false;

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: mockIsSignedIn }),
}));

vi.mock("@/jobs/useJobBoardRole", () => ({
  useJobBoardRole: () => ({ role: mockJobBoardRole, isLoaded: true }),
}));

vi.mock("@/components/shared/AnimatedSection", () => ({
  AnimatedSection: ({ children }: { children: ReactNode }) => <>{children}</>,
  StaggerContainer: ({ children }: { children: ReactNode }) => <>{children}</>,
  StaggerItem: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

afterEach(() => {
  cleanup();
  mockJobBoardRole = null;
  mockIsSignedIn = false;
});

const baseProps = {
  search: "",
  onSearchChange: () => {},
  category: "",
  onCategoryChange: () => {},
};

describe("JobHero CTAs", () => {
  it("shows both role-entry CTAs for signed-out users", async () => {
    const { JobHero } = await import("@/components/jobs/JobHero");
    render(<JobHero {...baseProps} />);

    expect(screen.getByRole("link", { name: /Find Your Next AI Role/i })).toHaveAttribute(
      "href",
      "/sign-up?redirect_url=%2Fjobs%2Fonboarding%3Frole%3Djobseeker"
    );
    expect(screen.getByRole("link", { name: /Hire AI Talent/i })).toHaveAttribute(
      "href",
      "/sign-up?redirect_url=%2Fjobs%2Fonboarding%3Frole%3Drecruiter"
    );
  });

  it("routes signed-in users without a job-board role straight to onboarding", async () => {
    mockIsSignedIn = true;
    const { JobHero } = await import("@/components/jobs/JobHero");
    render(<JobHero {...baseProps} />);

    expect(screen.getByRole("link", { name: /Find Your Next AI Role/i })).toHaveAttribute(
      "href",
      "/jobs/onboarding?role=jobseeker"
    );
    expect(screen.getByRole("link", { name: /Hire AI Talent/i })).toHaveAttribute(
      "href",
      "/jobs/onboarding?role=recruiter"
    );
  });

  it("shows only My Applications for jobseekers", async () => {
    mockIsSignedIn = true;
    mockJobBoardRole = "jobseeker";
    const { JobHero } = await import("@/components/jobs/JobHero");
    render(<JobHero {...baseProps} />);

    expect(screen.getByRole("link", { name: /My Applications/i })).toHaveAttribute(
      "href",
      "/jobs/dashboard"
    );
    expect(screen.queryByRole("link", { name: /Hire AI Talent/i })).not.toBeInTheDocument();
  });

  it("shows only Post a Job for recruiters", async () => {
    mockIsSignedIn = true;
    mockJobBoardRole = "recruiter";
    const { JobHero } = await import("@/components/jobs/JobHero");
    render(<JobHero {...baseProps} />);

    expect(screen.getByRole("link", { name: /Post a Job/i })).toHaveAttribute(
      "href",
      "/jobs/post"
    );
    expect(
      screen.queryByRole("link", { name: /Find Your Next AI Role/i })
    ).not.toBeInTheDocument();
  });
});
