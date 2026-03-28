import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FilterSidebar } from "@/components/directory/FilterSidebar";

describe("FilterSidebar", () => {
  it("exposes the expanded industry taxonomy in directory filters", () => {
    render(
      <FilterSidebar
        filters={{ functional: [], industry: [], infrastructure: [] }}
        onFilterChange={vi.fn()}
        agentCounts={{}}
      />
    );

    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Professional Services")).toBeInTheDocument();
    expect(screen.getByText("Gaming & Entertainment")).toBeInTheDocument();
    expect(screen.getByText("Crypto & Web3")).toBeInTheDocument();
  });
});
