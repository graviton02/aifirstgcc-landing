import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AgentDetailView } from "@/components/dashboard/AgentDetailView";

describe("AgentDetailView", () => {
  it("shows functional and industry categories without rendering business functions", () => {
    render(
      <AgentDetailView
        agent={
          {
            _id: "agent-1",
            agent_name: "DocuMind AI",
            description: "Automates document-heavy workflows.",
            category: "Data & Analytics",
            functional_categories: ["Data & Analytics", "Finance & Accounting"],
            industry_categories: ["Financial Services (BFSI)", "Technology"],
            infrastructure_categories: ["Agent Platforms & Builders"],
            business_functions: ["Data & Analytics", "Finance & Accounting"],
            use_cases: [],
            expected_outcomes: [],
            integrations: [],
            status: "active",
          } as any
        }
        companyId="company-1"
        onBack={() => {}}
        pendingEdits={[]}
      />
    );

    expect(screen.getByText("Functional Categories")).toBeInTheDocument();
    expect(screen.getByText("Industry Categories")).toBeInTheDocument();
    expect(screen.queryByText("Business Functions")).not.toBeInTheDocument();
    expect(screen.getByText("Technology")).toBeInTheDocument();
  });
});
