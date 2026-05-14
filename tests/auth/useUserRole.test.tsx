import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUserRole } from "@/auth/useUserRole";

const useQueryMock = vi.fn();

let mockAuthLoaded = true;
let mockIsSignedIn = false;
let mockViewerContext:
  | { role: "provider" | "gcc" | null; providerSetupStarted: boolean }
  | undefined;

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    isLoaded: mockAuthLoaded,
    isSignedIn: mockIsSignedIn,
  }),
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

function Probe() {
  const state = useUserRole();

  return <pre>{JSON.stringify(state)}</pre>;
}

describe("useUserRole", () => {
  beforeEach(() => {
    mockAuthLoaded = true;
    mockIsSignedIn = false;
    mockViewerContext = undefined;
    useQueryMock.mockReset();
    useQueryMock.mockImplementation((_queryRef, args) => {
      expect(args).toEqual(mockIsSignedIn ? {} : "skip");
      return mockViewerContext;
    });
  });

  it("skips the Convex viewer query for signed-out visitors", async () => {
    render(<Probe />);

    expect(useQueryMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/"role":null/)).toBeInTheDocument();
    expect(screen.getByText(/"isLoaded":true/)).toBeInTheDocument();
  });

  it("loads the viewer context only for signed-in users", async () => {
    mockIsSignedIn = true;
    mockViewerContext = {
      role: "provider",
      providerSetupStarted: true,
    };

    render(<Probe />);

    expect(useQueryMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/"role":"provider"/)).toBeInTheDocument();
    expect(screen.getByText(/"providerSetupStarted":true/)).toBeInTheDocument();
  });
});
