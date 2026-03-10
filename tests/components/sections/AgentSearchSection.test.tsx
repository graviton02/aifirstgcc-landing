import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock convex/react
vi.mock("convex/react", () => ({
  useQuery: () => [],
}));

describe("AgentSearchSection", () => {
  it("renders search bar and heading", async () => {
    const { AgentSearchSection } = await import("@/components/sections/AgentSearchSection");
    render(<AgentSearchSection />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByText(/search for your agent/i)).toBeInTheDocument();
  });
});
