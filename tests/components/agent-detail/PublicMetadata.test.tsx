import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useAuthMock = vi.fn();
const useUserRoleMock = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/auth/useUserRole", () => ({
  useUserRole: () => useUserRoleMock(),
}));

vi.mock("@/components/directory/CompanyLogo", () => ({
  CompanyLogo: () => <div>Company Logo</div>,
}));

vi.mock("@/components/reachout/ReachoutRequestButton", () => ({
  ReachoutRequestButton: () => <button type="button">Contact Provider</button>,
}));

vi.mock("@/components/shared/ShortlistButton", () => ({
  ShortlistButton: () => <button type="button">Shortlist</button>,
}));

describe("Public agent detail metadata", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useUserRoleMock.mockReset();

    useAuthMock.mockReturnValue({ isSignedIn: false });
    useUserRoleMock.mockReturnValue({ role: null, isLoaded: true });
  });

  it("shows company basics and infrastructure metadata without rendering broken founded text", async () => {
    const { AgentStatsPanel } = await import(
      "@/components/agent-detail/AgentStatsPanel"
    );

    render(
      <AgentStatsPanel
        agent={
          {
            _id: "agent-1",
            agent_name: "Ops Pilot",
            description: "Handles operations workflows.",
            category: "IT Operations",
            use_cases: [{ title: "Triage", description: "Sort incidents" }],
            functional_categories: ["IT Operations"],
            industry_categories: ["Technology"],
            infrastructure_categories: ["Cloud", "On-Premise"],
            status: "active",
          } as any
        }
        company={
          {
            _id: "company-1",
            slug: "acme-ai",
            name: "Acme AI",
            description: "Builds AI systems.",
            website: "https://acme.example.com",
            headquarters: "Bengaluru, India",
            primary_verticals: ["Technology", "Retail"],
            claim_status: "claimed",
            verification_status: "verified",
            contact_email: "hello@acme.example.com",
          } as any
        }
      />
    );

    expect(screen.getByText("Primary Verticals")).toBeInTheDocument();
    expect(screen.getAllByText("Technology").length).toBeGreaterThan(0);
    expect(screen.getByText("Retail")).toBeInTheDocument();
    expect(screen.getByText("Infrastructure")).toBeInTheDocument();
    expect(screen.getByText("Cloud")).toBeInTheDocument();
    expect(screen.queryByText(/Founded/)).not.toBeInTheDocument();
    expect(screen.queryByText("hello@acme.example.com")).not.toBeInTheDocument();
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /claim this profile/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /claim & customize your profile/i })
    ).not.toBeInTheDocument();
  });

  it("shows exactly one claim CTA for signed-out users on unclaimed company profiles", async () => {
    const { AgentStatsPanel } = await import(
      "@/components/agent-detail/AgentStatsPanel"
    );

    render(
      <AgentStatsPanel
        agent={
          {
            _id: "agent-1",
            agent_name: "Ops Pilot",
            description: "Handles operations workflows.",
            category: "IT Operations",
            use_cases: [{ title: "Triage", description: "Sort incidents" }],
            functional_categories: ["IT Operations"],
            industry_categories: ["Technology"],
            infrastructure_categories: ["Cloud"],
            status: "active",
          } as any
        }
        company={
          {
            _id: "company-1",
            slug: "acme-ai",
            name: "Acme AI",
            description: "Builds AI systems.",
            website: "https://acme.example.com",
            headquarters: "Bengaluru, India",
            primary_verticals: ["Technology"],
            claim_status: "unclaimed",
            verification_status: "unverified",
          } as any
        }
      />
    );

    expect(
      screen.queryByRole("link", { name: /claim this profile/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /claim & customize your profile/i })
    ).toBeInTheDocument();
  });

  it("hides all claim CTAs for signed-in GCC users on unclaimed company profiles", async () => {
    useAuthMock.mockReturnValue({ isSignedIn: true });
    useUserRoleMock.mockReturnValue({ role: "gcc", isLoaded: true });

    const { AgentStatsPanel } = await import(
      "@/components/agent-detail/AgentStatsPanel"
    );

    render(
      <AgentStatsPanel
        agent={
          {
            _id: "agent-1",
            agent_name: "Ops Pilot",
            description: "Handles operations workflows.",
            category: "IT Operations",
            use_cases: [{ title: "Triage", description: "Sort incidents" }],
            functional_categories: ["IT Operations"],
            industry_categories: ["Technology"],
            infrastructure_categories: ["Cloud"],
            status: "active",
          } as any
        }
        company={
          {
            _id: "company-1",
            slug: "acme-ai",
            name: "Acme AI",
            description: "Builds AI systems.",
            website: "https://acme.example.com",
            headquarters: "Bengaluru, India",
            primary_verticals: ["Technology"],
            claim_status: "unclaimed",
            verification_status: "unverified",
          } as any
        }
      />
    );

    expect(
      screen.queryByRole("link", { name: /claim this profile/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /claim & customize your profile/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /contact provider/i })
    ).toBeInTheDocument();
  });

  it("shows both product and demo links when available", async () => {
    const { AgentHero } = await import("@/components/agent-detail/AgentHero");

    render(
      <AgentHero
        agent={
          {
            _id: "agent-1",
            slug: "ops-pilot",
            agent_name: "Ops Pilot",
            tagline: "Faster incident routing.",
            description: "Handles operations workflows.",
            category: "IT Operations",
            source_url: "https://acme.example.com/product",
            demo_url: "https://acme.example.com/demo",
            use_cases: [],
            status: "active",
          } as any
        }
        company={
          {
            _id: "company-1",
            slug: "acme-ai",
            name: "Acme AI",
          } as any
        }
      />
    );

    expect(
      screen.getByRole("link", { name: /visit product page/i })
    ).toHaveAttribute("href", "https://acme.example.com/product");
    expect(screen.getByRole("link", { name: /view demo/i })).toHaveAttribute(
      "href",
      "https://acme.example.com/demo"
    );
    expect(screen.getByText("Company Logo")).toBeInTheDocument();
  });
});
