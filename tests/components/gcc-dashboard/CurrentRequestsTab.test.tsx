import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useQueryMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

describe("CurrentRequestsTab", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useQueryMock.mockReturnValue([
      {
        _id: "request-1",
        status: "approved",
        created_at: Date.now(),
        reviewed_at: Date.now(),
        contacted_at: undefined,
        use_case: "Incident triage automation",
        timeline: "This quarter",
        current_challenge: "Routing still happens manually across multiple queues.",
        expected_outcome: "Shorter resolution time and cleaner reporting.",
        admin_notes: null,
        review_id: null,
        review_status: null,
        agent: {
          slug: "ops-pilot",
          agent_name: "Ops Pilot",
        },
        company: {
          name: "Acme AI",
        },
      },
    ]);
  });

  it("shows the review action even before the request is marked contacted", async () => {
    const { CurrentRequestsTab } = await import(
      "@/components/gcc-dashboard/CurrentRequestsTab"
    );

    render(<CurrentRequestsTab />);

    expect(
      screen.getByText(/you can leave a review for this agent from its profile page/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /leave review/i })).toHaveAttribute(
      "href",
      "/agents/ops-pilot#reviews"
    );
  });
});
