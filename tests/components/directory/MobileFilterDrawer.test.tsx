import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileFilterDrawer } from "@/components/directory/MobileFilterDrawer";

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

describe("MobileFilterDrawer", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("shows a functional tab note while keeping industry filters interactive", () => {
    const onFilterChange = vi.fn();

    render(
      <MobileFilterDrawer
        open
        onClose={vi.fn()}
        filters={{ functional: [], industry: ["Technology"], infrastructure: [] }}
        onFilterChange={onFilterChange}
        agentCounts={{ Technology: 3 }}
        activeCount={1}
        activeTab="Customer Experience"
      />
    );

    expect(screen.getByText("Filtered by tab: Customer Experience")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sales & marketing/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /technology/i }));

    expect(onFilterChange).toHaveBeenCalledWith({
      functional: [],
      industry: [],
      infrastructure: [],
    });
  });

  it("clears secondary filters without affecting the active tab", () => {
    const onFilterChange = vi.fn();

    render(
      <MobileFilterDrawer
        open
        onClose={vi.fn()}
        filters={{ functional: [], industry: ["Technology"], infrastructure: [] }}
        onFilterChange={onFilterChange}
        agentCounts={{}}
        activeCount={1}
        activeTab="Sales & Marketing"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /clear all/i }));

    expect(onFilterChange).toHaveBeenCalledWith({
      functional: [],
      industry: [],
      infrastructure: [],
    });
    expect(screen.getByText("Filtered by tab: Sales & Marketing")).toBeInTheDocument();
  });
});
