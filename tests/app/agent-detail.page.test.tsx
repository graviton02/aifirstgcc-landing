import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchQueryMock = vi.fn();

vi.mock("convex/nextjs", () => ({
  fetchQuery: (...args: unknown[]) => fetchQueryMock(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("notFound");
  }),
}));

vi.mock("@/components/shared/Navbar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

vi.mock("@/components/agent-detail/AgentHero", () => ({
  AgentHero: () => <div>Agent Hero</div>,
}));

vi.mock("@/components/agent-detail/AgentDetailSections", () => ({
  AgentDetailSections: () => <div>Agent Detail Sections</div>,
}));

vi.mock("@/components/agent-detail/AgentStatsPanel", () => ({
  AgentStatsPanel: () => <div>Agent Stats Panel</div>,
}));

vi.mock("@/components/reviews/ReviewsSection", () => ({
  ReviewsSection: () => <div>Reviews Section</div>,
}));

vi.mock("@/components/shared/Breadcrumbs", () => ({
  Breadcrumbs: () => <div>Breadcrumbs</div>,
}));

vi.mock("@/components/sections/Footer", () => ({
  Footer: () => <div>Footer</div>,
}));

vi.mock("@/components/compare/CompareTray", () => ({
  CompareTray: () => <div>Compare Tray</div>,
}));

describe("AgentDetailPage review metadata", () => {
  beforeEach(() => {
    fetchQueryMock.mockReset();
  });

  it("does not emit per-review JSON-LD or reviewer identity", async () => {
    fetchQueryMock
      .mockResolvedValueOnce({
        _id: "agent-1",
        slug: "ops-pilot",
        agent_name: "Ops Pilot",
        description: "Handles operational workflows.",
        category: "IT Operations",
        company_id: "company-1",
        status: "active",
        use_cases: [],
        rating: 4,
        review_count: 1,
      })
      .mockResolvedValueOnce({
        _id: "company-1",
        slug: "acme-ai",
        name: "Acme AI",
        website: "https://acme.example.com",
      })
      .mockResolvedValueOnce({
        summary: {
          overallRating: 4,
          reviewCount: 1,
          effectivenessRating: 3,
          valueRating: 2,
        },
        reviews: [
          {
            _id: "review-1",
            reviewer_name: "Priya Sharma",
            reviewer_organization: "Global Capability Center",
            rating_overall: 4,
            rating_effectiveness: 3,
            rating_value: 2,
            title: "Reliable ops support",
            pros:
              "The workflow improved our ticket triage quality and gave us better operational consistency.",
            cons:
              "The first implementation pass took longer than expected and needed better handoff detail.",
            created_at: Date.now(),
            updated_at: Date.now(),
          },
        ],
        nextCursor: null,
      });

    const Page = (await import("@/app/agents/[slug]/page")).default;
    const page = await Page({
      params: Promise.resolve({ slug: "ops-pilot" }),
    });

    render(page);

    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    ).map((node) => node.textContent ?? "");
    const joinedScripts = scripts.join("\n");

    expect(scripts).toHaveLength(2);
    expect(joinedScripts).not.toContain('"@type":"Review"');
    expect(joinedScripts).not.toContain("Priya Sharma");
    expect(joinedScripts).not.toContain("Global Capability Center");
  });

  it("builds metadata from the slug without querying Convex", async () => {
    const { generateMetadata } = await import("@/app/agents/[slug]/page");

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "generative-search" }),
    });

    expect(fetchQueryMock).not.toHaveBeenCalled();
    expect(metadata.title).toBe("Generative Search | Orbys360");
    expect(metadata.description).toContain("Generative Search");
    expect(metadata.alternates?.canonical).toBe(
      "https://orbys360.com/agents/generative-search"
    );
  });
});
