import { describe, expect, it } from "vitest";
import { buildAgentSearchText } from "../../convex/lib/agentTaxonomy";

describe("buildAgentSearchText", () => {
  it("includes company, use-case, infrastructure, and alias terms", () => {
    const searchText = buildAgentSearchText({
      agent_name: "Orbit CX Copilot",
      company_name: "Acme Systems",
      tagline: "Generative AI support for finance operations",
      description: "Helps enterprise teams route customer issues faster.",
      category: "Customer Experience",
      functional_categories: ["Customer Experience"],
      industry_categories: ["Technology"],
      infrastructure_categories: ["AI Infrastructure & Models"],
      integrations: ["Slack"],
      expected_outcomes: ["Faster response times"],
      use_cases: [
        {
          title: "Ticket triage",
          description: "Prioritizes and routes service cases automatically.",
        },
      ],
    });

    expect(searchText).toContain("Orbit CX Copilot");
    expect(searchText).toContain("Acme Systems");
    expect(searchText).toContain("Ticket triage");
    expect(searchText).toContain("AI Infrastructure & Models");
    expect(searchText.toLowerCase()).toContain("customer experience");
    expect(searchText.toLowerCase()).toContain("cx");
    expect(searchText.toLowerCase()).toContain("generative ai");
    expect(searchText.toLowerCase()).toContain("genai");
    expect(searchText.toLowerCase()).toContain("finance operations");
    expect(searchText.toLowerCase()).toContain("finops");
  });

  it("preserves repeated high-priority terms for weighting", () => {
    const searchText = buildAgentSearchText({
      agent_name: "Ops Pilot",
      company_name: "Acme Systems",
      description: "Operational automation for enterprise teams.",
    });

    expect(searchText.match(/Ops Pilot/g)).toHaveLength(3);
    expect(searchText.match(/Acme Systems/g)).toHaveLength(2);
  });
});
