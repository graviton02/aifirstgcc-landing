import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FilterSidebar } from "@/components/directory/FilterSidebar";

describe("FilterSidebar", () => {
  it("exposes the expanded industry taxonomy in directory filters", () => {
    render(
      <FilterSidebar
        filters={{ functional: [], industry: [], infrastructure: [] }}
        onFilterChange={vi.fn()}
        agentCounts={{}}
        activeTab={null}
      />
    );

    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Professional Services")).toBeInTheDocument();
    expect(screen.getByText("Gaming & Entertainment")).toBeInTheDocument();
    expect(screen.getByText("Crypto & Web3")).toBeInTheDocument();
  });

  it("replaces the functional filters with a read-only note when a tab is active", () => {
    const onFilterChange = vi.fn();

    render(
      <FilterSidebar
        filters={{
          functional: [],
          industry: ["Technology"],
          infrastructure: [],
        }}
        onFilterChange={onFilterChange}
        agentCounts={{ Technology: 2 }}
        activeTab="Sales & Marketing"
      />
    );

    expect(screen.getByText("Filtered by tab: Sales & Marketing")).toBeInTheDocument();
    expect(screen.queryByLabelText("Customer Experience")).not.toBeInTheDocument();
    expect(screen.getByText("Technology")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear all filters/i }));

    expect(onFilterChange).toHaveBeenCalledWith({
      functional: [],
      industry: [],
      infrastructure: [],
    });
  });
});
