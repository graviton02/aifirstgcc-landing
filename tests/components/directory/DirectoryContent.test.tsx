import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerReplaceMock = vi.fn();
const useQueryMock = vi.fn();

let mockSearch = "";

const mockAgents = [
  {
    _id: "agent-1",
    agent_name: "Alpha CX",
    tagline: "Customer concierge",
    description: "Customer agent",
    category: "Customer Experience",
    company_id: "company-1",
    functional_categories: ["Customer Experience"],
    industry_categories: ["Technology"],
    infrastructure_categories: [],
    use_cases: [],
    status: "active",
  },
  {
    _id: "agent-2",
    agent_name: "Beta Sales",
    tagline: "Sales assistant",
    description: "Sales agent",
    category: "Sales & Marketing",
    company_id: "company-1",
    functional_categories: ["Sales & Marketing"],
    industry_categories: ["Technology"],
    infrastructure_categories: [],
    use_cases: [],
    status: "active",
  },
  {
    _id: "agent-3",
    agent_name: "Gamma Hybrid",
    tagline: "Sales and IT",
    description: "Hybrid agent",
    category: "IT Operations",
    company_id: "company-2",
    functional_categories: ["Sales & Marketing", "IT Operations"],
    industry_categories: ["Professional Services"],
    infrastructure_categories: ["Agent Platforms & Builders"],
    use_cases: [],
    status: "active",
  },
  {
    _id: "agent-4",
    agent_name: "Delta Ops",
    tagline: "Operations support",
    description: "IT agent",
    category: "IT Operations",
    company_id: "company-2",
    functional_categories: ["IT Operations"],
    industry_categories: ["Technology"],
    infrastructure_categories: ["AI Infrastructure & Models"],
    use_cases: [],
    status: "active",
  },
];

const mockCompanies = [
  { _id: "company-1", name: "Acme" },
  { _id: "company-2", name: "Globex" },
];

function filterAgents(args: {
  search?: string;
  tab?: string;
  functional?: string[];
  industry?: string[];
  infrastructure?: string[];
  page?: number;
  pageSize?: number;
}) {
  let filtered = [...mockAgents];

  if (args.search) {
    const query = args.search.toLowerCase();
    filtered = filtered.filter((agent) => {
      const companyName =
        mockCompanies.find((company) => company._id === agent.company_id)?.name ?? "";

      return (
        agent.agent_name.toLowerCase().includes(query) ||
        (agent.tagline ?? "").toLowerCase().includes(query) ||
        agent.category.toLowerCase().includes(query) ||
        companyName.toLowerCase().includes(query)
      );
    });
  }

  const functionalFilters = [...(args.functional ?? [])];
  if (args.tab && !functionalFilters.includes(args.tab)) {
    functionalFilters.unshift(args.tab);
  }

  if (functionalFilters.length > 0) {
    filtered = filtered.filter((agent) =>
      (agent.functional_categories ?? []).some((category) =>
        functionalFilters.includes(category)
      )
    );
  }

  if ((args.industry ?? []).length > 0) {
    filtered = filtered.filter((agent) =>
      (agent.industry_categories ?? []).some((category) =>
        (args.industry ?? []).includes(category)
      )
    );
  }

  if ((args.infrastructure ?? []).length > 0) {
    filtered = filtered.filter((agent) =>
      (agent.infrastructure_categories ?? []).some((category) =>
        (args.infrastructure ?? []).includes(category)
      )
    );
  }

  return {
    data: filtered.slice(0, args.pageSize ?? 20),
    count: filtered.length,
    totalAgents: mockAgents.length,
    companyCount: mockCompanies.length,
    categoryCounts: buildCategoryCounts(mockAgents),
    suggestions: { agents: [], companies: [], categories: [] },
  };
}

function buildCategoryCounts(agents: typeof mockAgents) {
  const counts: Record<string, number> = {};

  for (const agent of agents) {
    for (const category of agent.functional_categories ?? []) {
      counts[category] = (counts[category] ?? 0) + 1;
    }
    for (const category of agent.industry_categories ?? []) {
      counts[category] = (counts[category] ?? 0) + 1;
    }
    for (const category of agent.infrastructure_categories ?? []) {
      counts[category] = (counts[category] ?? 0) + 1;
    }
  }

  return counts;
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
  usePathname: () => "/directory",
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isSignedIn: true }),
}));

vi.mock("@vercel/analytics", () => ({
  track: vi.fn(),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

vi.mock("@/components/shared/Navbar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

vi.mock("@/components/sections/Footer", () => ({
  Footer: () => <div>Footer</div>,
}));

vi.mock("@/components/compare/CompareTray", () => ({
  CompareTray: () => null,
}));

vi.mock("@/components/directory/AgentCard", () => ({
  AgentCard: ({ agent }: { agent: { agent_name: string } }) => (
    <div data-testid="agent-card">{agent.agent_name}</div>
  ),
}));

describe("DirectoryContent", () => {
  beforeEach(() => {
    mockSearch = "";
    routerReplaceMock.mockReset();
    useQueryMock.mockReset();
    useQueryMock.mockImplementation((_queryRef, args) => {
      if (args && typeof args === "object" && "pageSize" in args) {
        return filterAgents(args ?? {});
      }

      if (args && typeof args === "object" && Object.keys(args).length === 0) {
        return [];
      }

      return undefined;
    });
    window.scrollTo = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("uses a valid tab slug from the query string", async () => {
    mockSearch = "tab=sales-marketing";

    const DirectoryContent = (await import("@/components/directory/DirectoryContent")).default;
    render(<DirectoryContent />);

    const tablist = screen.getByRole("tablist", {
      name: /functional categories/i,
    });

    expect(
      within(tablist).getByRole("tab", { name: /sales & marketing/i })
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Beta Sales")).toBeInTheDocument();
    expect(screen.getByText("Gamma Hybrid")).toBeInTheDocument();
    expect(screen.queryByText("Alpha CX")).not.toBeInTheDocument();
  });

  it("falls back to All for an invalid tab slug", async () => {
    mockSearch = "tab=not-real";

    const DirectoryContent = (await import("@/components/directory/DirectoryContent")).default;
    render(<DirectoryContent />);

    const tablist = screen.getByRole("tablist", {
      name: /functional categories/i,
    });

    expect(within(tablist).getByRole("tab", { name: /all/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getAllByTestId("agent-card")).toHaveLength(4);
  });

  it("updates the URL when a category tab is selected", async () => {
    mockSearch = "search=alpha";

    const DirectoryContent = (await import("@/components/directory/DirectoryContent")).default;
    render(<DirectoryContent />);

    const tablist = screen.getByRole("tablist", {
      name: /functional categories/i,
    });

    fireEvent.click(
      within(tablist).getByRole("tab", { name: /customer experience/i })
    );

    expect(routerReplaceMock).toHaveBeenCalledWith(
      "/directory?search=alpha&tab=customer-experience"
    );
  });

  it("clears functional checkbox filters when a tab becomes active", async () => {
    const DirectoryContent = (await import("@/components/directory/DirectoryContent")).default;
    const { rerender } = render(<DirectoryContent />);

    fireEvent.click(
      screen.getByRole("checkbox", { name: /IT Operations/i, hidden: true })
    );

    expect(screen.getByText("Delta Ops")).toBeInTheDocument();
    expect(screen.getByText("Gamma Hybrid")).toBeInTheDocument();
    expect(screen.queryByText("Alpha CX")).not.toBeInTheDocument();

    const tablist = screen.getByRole("tablist", {
      name: /functional categories/i,
    });
    fireEvent.click(
      within(tablist).getByRole("tab", { name: /customer experience/i })
    );

    mockSearch = "tab=customer-experience";
    rerender(<DirectoryContent />);

    expect(screen.getByText("Filtered by tab: Customer Experience")).toBeInTheDocument();
    expect(screen.queryByLabelText("IT Operations")).not.toBeInTheDocument();
    expect(screen.getByText("Alpha CX")).toBeInTheDocument();
    expect(screen.queryByText("Delta Ops")).not.toBeInTheDocument();
  });

  it("supports infrastructure filters from the sidebar", async () => {
    const DirectoryContent = (await import("@/components/directory/DirectoryContent")).default;
    render(<DirectoryContent />);

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /AI Infrastructure & Models/i,
        hidden: true,
      })
    );

    expect(screen.getByText("Delta Ops")).toBeInTheDocument();
    expect(screen.queryByText("Alpha CX")).not.toBeInTheDocument();
    expect(screen.queryByText("Beta Sales")).not.toBeInTheDocument();
  });
});
