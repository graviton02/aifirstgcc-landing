import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AgentCard } from "@/components/directory/AgentCard";

const mockAgent = {
  _id: "123" as any,
  slug: "test-agent",
  agent_name: "TestAgent",
  tagline: "AI for testing",
  category: "Testing",
  functional_categories: ["Engineering & DevOps"],
};

describe("AgentCard", () => {
  it("renders agent name", () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText("TestAgent")).toBeInTheDocument();
  });

  it("links to agent detail page", () => {
    render(<AgentCard agent={mockAgent} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/agents/test-agent");
  });
});
