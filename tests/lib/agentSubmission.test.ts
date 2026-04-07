import { describe, expect, it } from "vitest";
import {
  getAgentDraftValidationErrors,
  normalizeAgentDraftInput,
} from "@/lib/agentSubmission";

describe("agent submission helpers", () => {
  it("normalizes aliases and trims use cases", () => {
    const normalized = normalizeAgentDraftInput({
      agent_name: "  QueuePilot  ",
      description: "  Handles triage  ",
      category: "IT Operations",
      functional_categories: [" Human Resources ", "IT Operations"],
      industry_categories: ["Insurance", "Technology"],
      use_cases: [
        { title: " Ticket triage ", description: " Routes incidents " },
        { title: "   ", description: "Ignored" },
      ],
    });

    expect(normalized.agent_name).toBe("QueuePilot");
    expect(normalized.description).toBe("Handles triage");
    expect(normalized.functional_categories).toEqual([
      "HR & Workforce",
      "IT Operations",
    ]);
    expect(normalized.industry_categories).toEqual([
      "Financial Services (BFSI)",
      "Technology",
    ]);
    expect(normalized.use_cases).toEqual([
      { title: "Ticket triage", description: "Routes incidents" },
    ]);
  });

  it("reports the required agent fields for incomplete drafts", () => {
    expect(
      getAgentDraftValidationErrors({
        agent_name: "",
        description: "",
        category: "",
        functional_categories: [],
        industry_categories: [],
        use_cases: [],
      })
    ).toEqual([
      "Agent name is required.",
      "Category is required.",
      "Description is required.",
      "Select at least one functional category.",
      "Select at least one industry category.",
      "Tagline is required.",
      "Add at least one use case.",
      "Add at least one integration.",
      "Add at least one expected outcome.",
      "Product page URL is required.",
    ]);
  });
});
