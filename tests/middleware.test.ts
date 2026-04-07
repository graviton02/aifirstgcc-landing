// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

const { clerkMiddlewareMock, createRouteMatcherMock } = vi.hoisted(() => ({
  clerkMiddlewareMock: vi.fn((handler: unknown) => handler),
  createRouteMatcherMock: vi.fn((patterns: string[]) => {
    const prefixes = patterns.map((pattern) => pattern.replace("(.*)", ""));
    return (req: { nextUrl: { pathname: string } }) =>
      prefixes.some((prefix) => {
        const normalized = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
        return (
          req.nextUrl.pathname === normalized ||
          req.nextUrl.pathname.startsWith(`${normalized}/`)
        );
      });
  }),
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: clerkMiddlewareMock,
  createRouteMatcher: createRouteMatcherMock,
}));

import middleware from "../middleware";

describe("middleware route protection", () => {
  it("protects admin routes", async () => {
    const protect = vi.fn();

    await middleware({ protect } as never, {
      nextUrl: { pathname: "/admin" },
    } as never);

    expect(protect).toHaveBeenCalledTimes(1);
  });

  it("protects admin API routes", async () => {
    const protect = vi.fn();

    await middleware({ protect } as never, {
      nextUrl: { pathname: "/api/admin/reconcile-provider-auth" },
    } as never);

    expect(protect).toHaveBeenCalledTimes(1);
  });

  it("does not protect public routes", async () => {
    const protect = vi.fn();

    await middleware({ protect } as never, {
      nextUrl: { pathname: "/directory" },
    } as never);

    expect(protect).not.toHaveBeenCalled();
  });
});
