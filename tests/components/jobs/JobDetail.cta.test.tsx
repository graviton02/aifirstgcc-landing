import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let mockIsSignedIn = false;
let mockJobBoardRole: "jobseeker" | "recruiter" | null = null;

const job = {
  _id: "job_1",
  title: "AI Engineer",
  company_name: "Acme",
  location: "Remote",
  workplace_type: "remote",
  job_type: "full-time",
  seniority: "mid",
  category: "engineering",
  description: "Build cool stuff.",
  can_apply: true,
  apply_url: null,
};

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: mockIsSignedIn }),
}));

vi.mock("@/jobs/useJobBoardRole", () => ({
  useJobBoardRole: () => ({
    role: mockJobBoardRole,
    isLoaded: true,
    profile: null,
  }),
}));

vi.mock("convex/react", () => ({
  useQuery: (_ref: unknown, args: any) => {
    if (args?.slug) return job;
    if (args?.job_id) return false;
    return undefined;
  },
}));

vi.mock("@/components/shared/AnimatedSection", () => ({
  AnimatedSection: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

afterEach(() => {
  cleanup();
  mockIsSignedIn = false;
  mockJobBoardRole = null;
});

describe("JobDetail Apply CTA role intent", () => {
  it("signed-out apply carries role=jobseeker into the sign-in redirect", async () => {
    const { JobDetail } = await import("@/components/jobs/JobDetail");
    render(<JobDetail slug="ai-engineer" />);

    const cta = screen.getByRole("link", { name: /Sign in to apply/i });
    expect(cta.getAttribute("href")).toContain("role%3Djobseeker");
  });

  it("signed-in no-role apply links to onboarding with jobseeker intent", async () => {
    mockIsSignedIn = true;
    const { JobDetail } = await import("@/components/jobs/JobDetail");
    render(<JobDetail slug="ai-engineer" />);

    expect(
      screen.getByRole("link", { name: /Set up your Job Board profile/i })
    ).toHaveAttribute(
      "href",
      "/jobs/onboarding?role=jobseeker&returnUrl=%2Fjobs%2Fai-engineer"
    );
  });
});
