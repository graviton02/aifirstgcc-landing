import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

describe("ReviewsTab", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    useMutationMock.mockReturnValue(vi.fn());
    useQueryMock.mockReturnValue({
      summary: {
        averageRating: 4,
        totalReviews: 1,
        responseRate: 0,
      },
      reviews: [
        {
          _id: "review-1",
          reviewer_label: "Anonymous GCC Buyer",
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
          use_case: "Incident triage automation",
          status: "approved",
          created_at: Date.now(),
          updated_at: Date.now(),
          reviewed_at: Date.now(),
          agent: {
            agent_name: "Ops Pilot",
          },
          response: null,
        },
      ],
      nextCursor: null,
    });
  });

  it("shows the anonymous GCC label without exposing stored reviewer identity", async () => {
    const { ReviewsTab } = await import("@/components/dashboard/ReviewsTab");

    render(<ReviewsTab />);

    expect(screen.getByText(/Anonymous GCC Buyer/)).toBeInTheDocument();
    expect(screen.queryByText("Priya Sharma")).not.toBeInTheDocument();
    expect(screen.queryByText("Global Capability Center")).not.toBeInTheDocument();
  });
});
