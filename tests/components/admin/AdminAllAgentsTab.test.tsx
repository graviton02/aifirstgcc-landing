import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminAllAgentsTab } from "@/components/admin/AdminAllAgentsTab";

const useQueryMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

describe("AdminAllAgentsTab", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useQueryMock.mockReturnValue([
      {
        _id: "agent-1",
        agent_name: "Acme Resolver",
        tagline: "Handles IT incidents",
        description: "Routes and resolves incoming incidents.",
        category: "IT Operations",
        status: "active",
        company: { name: "Acme AI Labs" },
        functional_categories: ["IT Operations"],
        industry_categories: ["Technology"],
        use_cases: [{ title: "Incident triage", description: "" }],
      },
      {
        _id: "agent-2",
        agent_name: "Dormant Agent",
        tagline: "",
        description: "Inactive record.",
        category: "Customer Experience",
        status: "inactive",
        company: { name: "Legacy Co" },
        functional_categories: ["Customer Experience"],
        industry_categories: ["Retail & E-commerce"],
        use_cases: [{ title: "Inbox deflection", description: "" }],
      },
    ]);
  });

  it("lists active agents and exposes full details in the admin catalog", () => {
    render(<AdminAllAgentsTab />);

    expect(screen.getByText("Acme Resolver")).toBeInTheDocument();
    expect(screen.queryByText("Dormant Agent")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show details/i }));

    expect(screen.getByText("Functional Categories:")).toBeInTheDocument();
    expect(screen.getAllByText("IT Operations").length).toBeGreaterThan(0);
    expect(screen.getByText("Use Cases:")).toBeInTheDocument();
  });
});
