import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useQueryMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

describe("MyReviewsTab", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useQueryMock.mockReturnValue({
      reviews: [],
      nextCursor: null,
    });
  });

  it("uses the updated empty-state copy for open review access", async () => {
    const { MyReviewsTab } = await import("@/components/gcc-dashboard/MyReviewsTab");

    render(<MyReviewsTab />);

    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /leave a review from any claimed agent page when you're ready to share feedback/i
      )
    ).toBeInTheDocument();
  });
});
