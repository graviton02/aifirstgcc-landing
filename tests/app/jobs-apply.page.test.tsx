import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let mockJobBoardRole: "jobseeker" | "recruiter" | null = "jobseeker";
const replaceMock = vi.fn();
const mockProfile = {
  name: "Jane Doe",
  email: "jane@example.com",
  current_title: "ML Engineer",
  phone: "+91 99999 11111",
  linkedin_url: "",
};

const job = {
  _id: "job_1",
  title: "AI Engineer",
  company_name: "Acme",
  category: "engineering",
  location: "Remote",
  workplace_type: "remote",
  job_type: "full-time",
  seniority: "mid",
  description: "Build AI systems.",
};

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
    profile: mockProfile,
    role: mockJobBoardRole,
    isLoaded: true,
    isSignedIn: true,
  }),
}));

vi.mock("convex/react", () => ({
  useQuery: (_ref: unknown, args: any) => {
    if (args?.slug) return job;
    if (args?.job_id) return false;
    return undefined;
  },
  useMutation: () => vi.fn(),
}));

vi.mock("@/components/shared/Navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/shared/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/shared/Breadcrumbs", () => ({ Breadcrumbs: () => null }));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  return {
    motion: new Proxy(
      {},
      {
        get: (_, tag: string) =>
          ({ children, ...props }: any) =>
            React.createElement(tag, props, children),
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("@/lib/jobResumeUpload", () => ({
  validateResumeFile: () => null,
}));

vi.mock("@/lib/report-error", () => ({
  getErrorMessage: (_error: unknown, fallback: string) => fallback,
}));

beforeEach(() => {
  mockJobBoardRole = "jobseeker";
  replaceMock.mockReset();
});

afterEach(() => cleanup());

async function renderPage() {
  const Page = (await import("@/app/jobs/[slug]/apply/page")).default;
  render(<Page params={Promise.resolve({ slug: "ai-engineer" })} />);
}

describe("/jobs/[slug]/apply application form", () => {
  it("shows Applying as and keeps current title editable", async () => {
    await renderPage();

    expect(await screen.findByText(/Applying as/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current title/i)).toHaveValue("ML Engineer");
  });

  it("requires and validates LinkedIn URL", async () => {
    await renderPage();

    const input = (await screen.findByLabelText(/LinkedIn URL/i)) as HTMLInputElement;
    expect(input.required).toBe(true);

    fireEvent.change(input, { target: { value: "https://github.com/jane" } });
    fireEvent.blur(input);
    expect(screen.getByText(/LinkedIn URL must look like/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "www.linkedin.com/in/jane" } });
    fireEvent.blur(input);
    expect(screen.queryByText(/LinkedIn URL must look like/i)).not.toBeInTheDocument();
  });
});

describe("/jobs/[slug]/apply access guards", () => {
  it("shows the recruiter friendly block when role is recruiter", async () => {
    mockJobBoardRole = "recruiter";
    await renderPage();

    expect(await screen.findByText(/Recruiter accounts cannot apply/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/LinkedIn URL/i)).not.toBeInTheDocument();
  });

  it("redirects null-role users to onboarding with jobseeker intent", async () => {
    mockJobBoardRole = null;
    await renderPage();

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith(
        "/jobs/onboarding?role=jobseeker&returnUrl=%2Fjobs%2Fai-engineer%2Fapply"
      )
    );
  });
});
