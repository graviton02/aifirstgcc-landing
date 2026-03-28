import type { HTMLAttributes, ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let mockPathname = "/";
let mockIsSignedIn = false;
let mockIsAuthLoaded = true;
let mockRole: "gcc" | "provider" | null = null;

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
  useAuth: () => ({ isLoaded: mockIsAuthLoaded, isSignedIn: mockIsSignedIn }),
  UserButton: () => null,
}));

vi.mock("@/auth/useUserRole", () => ({
  useUserRole: () => ({ role: mockRole }),
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

  it("routes the dashboard link to the provider dashboard for providers", async () => {
    mockPathname = "/";
    mockIsSignedIn = true;
    mockRole = "provider";

    const { Navbar } = await import("@/components/shared/Navbar");
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/dashboard");
  });

  it("routes the dashboard link to the GCC dashboard for GCC users", async () => {
    mockPathname = "/";
    mockIsSignedIn = true;
    mockRole = "gcc";

    const { Navbar } = await import("@/components/shared/Navbar");
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/gcc-dashboard");
  });

  it("shows the notification bell for signed-in provider users", async () => {
    mockPathname = "/dashboard";
    mockIsSignedIn = true;
    mockRole = "provider";

    const { Navbar } = await import("@/components/shared/Navbar");
    render(<Navbar />);

    expect(screen.getAllByText("Notifications for provider").length).toBeGreaterThan(0);
  });

  it("does not show the notification bell when no supported dashboard persona is active", async () => {
    mockPathname = "/";
    mockIsSignedIn = true;
    mockRole = null;

    const { Navbar } = await import("@/components/shared/Navbar");
    render(<Navbar />);

    expect(screen.queryByText(/notifications for/i)).not.toBeInTheDocument();
  });
});
