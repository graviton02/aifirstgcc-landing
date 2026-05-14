import type { HTMLAttributes, ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let mockPathname = "/";
let mockIsSignedIn = false;
let mockIsAuthLoaded = true;
let mockRole: "gcc" | "provider" | null = null;
let mockJobBoardRole: "recruiter" | "jobseeker" | null = null;
const useAuthMock = vi.fn(() => ({ isLoaded: mockIsAuthLoaded, isSignedIn: mockIsSignedIn }));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => useAuthMock(),
  UserButton: () => null,
}));

vi.mock("@/auth/useUserRole", () => ({
  useUserRole: () => ({ role: mockRole, providerSetupStarted: false }),
}));

vi.mock("@/jobs/useJobBoardRole", () => ({
  useJobBoardRole: () => ({ role: mockJobBoardRole }),
}));

vi.mock("@/components/shared/NotificationBell", () => ({
  NotificationBell: ({ role }: { role: string }) => <div>Notifications for {role}</div>,
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const MOTION_PROPS = new Set([
    "animate",
    "exit",
    "initial",
    "layoutId",
    "transition",
    "whileHover",
    "whileTap",
  ]);

  const motion = new Proxy(
    {},
    {
      get: (_, tag: string) =>
        React.forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(({ children, ...props }, ref) => {
          const filteredProps = Object.fromEntries(
            Object.entries(props).filter(([key]) => !MOTION_PROPS.has(key)),
          );

          return React.createElement(tag, { ...filteredProps, ref }, children);
        }),
    },
  );

  return {
    motion,
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

afterEach(() => {
  cleanup();
  mockPathname = "/";
  mockIsSignedIn = false;
  mockIsAuthLoaded = true;
  mockRole = null;
  mockJobBoardRole = null;
  useAuthMock.mockClear();
});

describe("Navbar", () => {
  it("renders on the provider dashboard route", async () => {
    mockPathname = "/dashboard";

    const { Navbar } = await import("@/components/shared/Navbar");
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /orbys360/i })).toBeInTheDocument();
  });

  it("renders on the GCC dashboard route", async () => {
    mockPathname = "/gcc-dashboard";

    const { Navbar } = await import("@/components/shared/Navbar");
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /orbys360/i })).toBeInTheDocument();
  });

  it("keeps the shared navbar hidden on onboarding", async () => {
    mockPathname = "/onboarding";

    const { Navbar } = await import("@/components/shared/Navbar");
    const { container } = render(<Navbar />);

    expect(container.firstChild).toBeNull();
  });

  it("keeps public pages static even when auth state exists", async () => {
    mockPathname = "/";
    mockIsSignedIn = true;
    mockRole = "provider";

    const { Navbar } = await import("@/components/shared/Navbar");
    render(<Navbar />);

    expect(screen.queryByRole("link", { name: /dashboard/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Join Now/i })).toBeInTheDocument();
    expect(useAuthMock).not.toHaveBeenCalled();
  });

  it("routes the dashboard link to the provider dashboard for providers", async () => {
    mockPathname = "/dashboard";
    mockIsSignedIn = true;
    mockRole = "provider";

    const { NavbarAuthControls } = await import("@/components/shared/NavbarAuthControls");
    render(<NavbarAuthControls variant="desktop" pathname={mockPathname} hasScrolledBg={true} />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/dashboard");
  });

  it("routes the dashboard link to the GCC dashboard for GCC users", async () => {
    mockPathname = "/dashboard";
    mockIsSignedIn = true;
    mockRole = "gcc";

    const { NavbarAuthControls } = await import("@/components/shared/NavbarAuthControls");
    render(<NavbarAuthControls variant="desktop" pathname={mockPathname} hasScrolledBg={true} />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/gcc-dashboard");
  });

  it("shows the notification bell for signed-in provider users", async () => {
    mockPathname = "/dashboard";
    mockIsSignedIn = true;
    mockRole = "provider";

    const { NavbarAuthControls } = await import("@/components/shared/NavbarAuthControls");
    render(<NavbarAuthControls variant="desktop" pathname={mockPathname} hasScrolledBg={true} />);

    expect(screen.getAllByText("Notifications for provider").length).toBeGreaterThan(0);
  });

  it("does not show the notification bell when no supported dashboard persona is active", async () => {
    mockPathname = "/";
    mockIsSignedIn = true;
    mockRole = null;

    const { NavbarAuthControls } = await import("@/components/shared/NavbarAuthControls");
    render(<NavbarAuthControls variant="desktop" pathname={mockPathname} hasScrolledBg={true} />);

    expect(screen.queryByText(/notifications for/i)).not.toBeInTheDocument();
  });

  it("hides Join Now and shows Sign in on /jobs for signed-out users", async () => {
    mockPathname = "/jobs";

    const { NavbarAuthControls } = await import("@/components/shared/NavbarAuthControls");
    render(<NavbarAuthControls variant="desktop" pathname={mockPathname} hasScrolledBg={true} />);

    expect(screen.queryByRole("link", { name: /Join Now/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign in/i })).toHaveAttribute(
      "href",
      "/sign-in?redirect_url=%2Fjobs"
    );
  });

  it("preserves deep job paths in the Sign in redirect", async () => {
    mockPathname = "/jobs/ai-engineer";

    const { NavbarAuthControls } = await import("@/components/shared/NavbarAuthControls");
    render(<NavbarAuthControls variant="desktop" pathname={mockPathname} hasScrolledBg={true} />);

    expect(screen.getByRole("link", { name: /Sign in/i })).toHaveAttribute(
      "href",
      "/sign-in?redirect_url=%2Fjobs%2Fai-engineer"
    );
  });

  it("keeps Join Now on non-job pages for signed-out users", async () => {
    mockPathname = "/providers";

    const { Navbar } = await import("@/components/shared/Navbar");
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /Join Now/i })).toBeInTheDocument();
    expect(useAuthMock).not.toHaveBeenCalled();
  });

  it("routes Dashboard to the job dashboard on /jobs when a job-board role exists", async () => {
    mockPathname = "/jobs";
    mockIsSignedIn = true;
    mockRole = "gcc";
    mockJobBoardRole = "jobseeker";

    const { NavbarAuthControls } = await import("@/components/shared/NavbarAuthControls");
    render(<NavbarAuthControls variant="desktop" pathname={mockPathname} hasScrolledBg={true} />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/jobs/dashboard"
    );
  });

  it("keeps marketplace dashboard routing off /jobs", async () => {
    mockPathname = "/directory";
    mockIsSignedIn = true;
    mockRole = "gcc";
    mockJobBoardRole = "jobseeker";

    const { NavbarAuthControls } = await import("@/components/shared/NavbarAuthControls");
    render(<NavbarAuthControls variant="desktop" pathname={mockPathname} hasScrolledBg={true} />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/gcc-dashboard"
    );
  });
});
