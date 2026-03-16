import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { AgentCard } from "@/components/directory/AgentCard";
import { _resetCompareStore } from "@/hooks/useCompare";

const mockAgent = {
  _id: "123" as any,
  slug: "test-agent",
  agent_name: "TestAgent",
  tagline: "AI for testing",
  description: "A test agent",
  category: "Testing",
  status: "active",
  use_cases: [],
  functional_categories: ["Engineering & DevOps"],
};

describe("AgentCard", () => {
  beforeEach(() => {
    localStorage.clear();
    _resetCompareStore();
  });

  it("renders agent name", () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText("TestAgent")).toBeInTheDocument();
  });

  it("links to agent detail page", () => {
    render(<AgentCard agent={mockAgent} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/agents/test-agent");
  });

  it("renders compare button", () => {
    render(<AgentCard agent={mockAgent} />);
    const btn = screen.getByRole("button", { name: /compare/i });
    expect(btn).toBeInTheDocument();
  });

  it("compare button click does not navigate", () => {
    render(<AgentCard agent={mockAgent} />);
    const btn = screen.getByRole("button", { name: /compare/i });
    fireEvent.click(btn);
    // The link should NOT have been followed — we're still on the same page
    // and the button should now show "Added"
    expect(screen.getByRole("button", { name: /added/i })).toBeInTheDocument();
  });

  it("toggles compare state on click", () => {
    render(<AgentCard agent={mockAgent} />);
    const btn = screen.getByRole("button", { name: /compare/i });
    fireEvent.click(btn);
    expect(screen.getByRole("button", { name: /added/i })).toBeInTheDocument();

    // Click again to remove
    fireEvent.click(screen.getByRole("button", { name: /added/i }));
    expect(screen.getByRole("button", { name: /compare/i })).toBeInTheDocument();
  });

  it("compare button is in the bottom-right of the card", () => {
    render(<AgentCard agent={mockAgent} />);
    const btn = screen.getByRole("button", { name: /compare/i });
    // The button should have bottom/right positioning classes
    expect(btn.className).toMatch(/bottom/);
    expect(btn.className).toMatch(/right/);
  });
});
