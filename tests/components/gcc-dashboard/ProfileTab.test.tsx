import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useQueryMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

describe("GCC ProfileTab", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useQueryMock.mockReturnValue({
      name: "Priya Sharma",
      email: "priya@gcc.example",
      organization: "Global Capability Center",
      industry: "Financial Services (BFSI)",
    });
  });

  it("shows the stored GCC onboarding fields", async () => {
    const { ProfileTab } = await import("@/components/gcc-dashboard/ProfileTab");

    render(<ProfileTab />);

    expect(screen.getByText("Priya Sharma")).toBeInTheDocument();
    expect(screen.getByText("priya@gcc.example")).toBeInTheDocument();
    expect(screen.getByText("Global Capability Center")).toBeInTheDocument();
    expect(screen.getByText("Financial Services (BFSI)")).toBeInTheDocument();
  });
});
