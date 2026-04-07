import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ComparePage from "@/app/compare/page";

const mockRouterReplace = vi.fn();
const mockRemove = vi.fn();
const mockStoreReplace = vi.fn();

const mockAgents = {
  "agent-one": {
    _id: "agent-one-id",
    slug: "agent-one",
    agent_name: "Agent One",
    tagline: "First agent",
    description: "Handles intake.",
    category: "Customer Experience",
    company_id: "company-1",
    functional_categories: ["Customer Experience"],
    industry_categories: ["Technology"],
    use_cases: [{ title: "Intake", description: "" }],
    integrations: ["Slack"],
    expected_outcomes: ["Faster response times"],
    status: "active",
  },
  "agent-two": {
    _id: "agent-two-id",
    slug: "agent-two",
    agent_name: "Agent Two",
    tagline: "Second agent",
    description: "Handles triage.",
    category: "IT Operations",
    company_id: "company-2",
    functional_categories: ["IT Operations"],
    industry_categories: ["Financial Services (BFSI)"],
    use_cases: [{ title: "Triage", description: "" }],
    integrations: ["ServiceNow"],
    expected_outcomes: ["Lower ticket backlog"],
    status: "active",
  },
} as const;

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("agents=agent-one,agent-two"),
  useRouter: () => ({ replace: mockRouterReplace }),
}));

vi.mock("convex/react", () => ({
  useQuery: (_query: unknown, args?: unknown) => {
    if (args === "skip") return null;
    if (args && typeof args === "object" && "slugs" in args) {
      return (args as { slugs: Array<keyof typeof mockAgents> }).slugs.map(
        (slug) => mockAgents[slug]
      );
    }
    return undefined;
  },
}));

vi.mock("@/hooks/useCompare", () => ({
  useCompare: () => ({
    slugs: ["agent-one", "agent-two"],
    remove: mockRemove,
    replace: mockStoreReplace,
  }),
}));

vi.mock("@/components/shared/Navbar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

vi.mock("@/components/sections/Footer", () => ({
  Footer: () => <div>Footer</div>,
}));

vi.mock("@/components/directory/CompanyLogo", () => ({
  CompanyLogo: () => <div>Logo</div>,
}));

describe("ComparePage", () => {
  beforeEach(() => {
    mockRouterReplace.mockReset();
    mockRemove.mockReset();
    mockStoreReplace.mockReset();
  });

  it("renders functional and industry rows without the removed functions row", () => {
    render(<ComparePage />);

    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Industries")).toBeInTheDocument();
    expect(screen.queryByText(/^Functions$/)).not.toBeInTheDocument();
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Financial Services (BFSI)")).toBeInTheDocument();
  });
});
