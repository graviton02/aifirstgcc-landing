import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminAgentsTab } from "@/components/admin/AdminAgentsTab";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

describe("AdminAgentsTab", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    useMutationMock.mockReturnValue(vi.fn());

    useQueryMock.mockImplementation((_query: unknown, args?: unknown) => {
      if (args === "skip") {
        return [];
      }

      return [
        {
          _id: "submission-1",
          agent_name: "Acme Resolver",
          tagline: "Handles IT incidents",
          description: "Routes and resolves incoming incidents.",
          category: "IT Operations",
          created_at: Date.now(),
          company: { name: "Acme AI Labs" },
          functional_categories: ["IT Operations"],
          industry_categories: ["Technology"],
          infrastructure_categories: ["Cloud"],
          use_cases: [{ title: "Incident triage", description: "Prioritize cases" }],
          integrations: ["ServiceNow"],
          expected_outcomes: ["Lower backlog"],
          source_url: "https://acme.ai/source",
          demo_url: "https://acme.ai/demo",
          validation_errors: ["Add at least one use case."],
        },
      ];
    });
  });

  it("shows enriched company and full agent detail in the pending review dropdown", () => {
    render(<AdminAgentsTab token="admin-token" />);

    fireEvent.click(screen.getByRole("button", { name: /show more/i }));

    expect(screen.getByText("Acme AI Labs")).toBeInTheDocument();
    expect(screen.getByText("Industry Categories:")).toBeInTheDocument();
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Infrastructure Categories:")).toBeInTheDocument();
    expect(screen.getByText("Cloud")).toBeInTheDocument();
    expect(screen.getByText("Missing or invalid required fields")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /source url/i })).toHaveAttribute(
      "href",
      "https://acme.ai/source"
    );
    expect(screen.getByRole("link", { name: /demo url/i })).toHaveAttribute(
      "href",
      "https://acme.ai/demo"
    );
  });
});
