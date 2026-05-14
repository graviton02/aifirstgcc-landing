import type { HTMLAttributes, ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const createProfileMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("convex/react", () => ({
  useMutation: () => createProfileMock,
}));

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    user: {
      fullName: "Jane Doe",
      primaryEmailAddress: { emailAddress: "jane@example.com" },
    },
  }),
}));

vi.mock("@/components/shared/AnimatedSection", () => ({
  AnimatedSection: ({ children }: { children: ReactNode }) => <>{children}</>,
  StaggerContainer: ({ children }: { children: ReactNode }) => <>{children}</>,
  StaggerItem: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const MOTION_PROPS = new Set(["animate", "exit", "initial", "transition", "whileTap"]);

  const motion = new Proxy(
    {},
    {
      get: (_, tag: string) =>
        React.forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
          ({ children, ...props }, ref) => {
            const filteredProps = Object.fromEntries(
              Object.entries(props).filter(([key]) => !MOTION_PROPS.has(key))
            );
            return React.createElement(tag, { ...filteredProps, ref }, children);
          }
        ),
    }
  );

  return {
    motion,
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

afterEach(() => {
  cleanup();
  createProfileMock.mockReset();
  pushMock.mockReset();
});

describe("JobOnboarding", () => {
  it("renders the role picker when no presetRole is provided", async () => {
    const { JobOnboarding } = await import("@/components/jobs/JobOnboarding");
    render(<JobOnboarding returnUrl="/jobs/dashboard" />);

    expect(screen.getByText("Recruiter")).toBeInTheDocument();
    expect(screen.getByText("Job Seeker")).toBeInTheDocument();
  });

  it("hides the picker and renders the jobseeker form for presetRole='jobseeker'", async () => {
    const { JobOnboarding } = await import("@/components/jobs/JobOnboarding");
    render(<JobOnboarding returnUrl="/jobs/dashboard" presetRole="jobseeker" />);

    expect(screen.queryByText(/Choose carefully/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Current title/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Company name/i)).not.toBeInTheDocument();
  });

  it("hides the picker and renders the recruiter form for presetRole='recruiter'", async () => {
    const { JobOnboarding } = await import("@/components/jobs/JobOnboarding");
    render(<JobOnboarding returnUrl="/jobs/dashboard" presetRole="recruiter" />);

    expect(screen.getByLabelText(/Company name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Current title/i)).not.toBeInTheDocument();
  });

  it("does not collect LinkedIn or phone during onboarding", async () => {
    const { JobOnboarding } = await import("@/components/jobs/JobOnboarding");
    render(<JobOnboarding returnUrl="/jobs/dashboard" presetRole="jobseeker" />);

    expect(screen.queryByLabelText(/LinkedIn/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Phone/i)).not.toBeInTheDocument();
  });
});
