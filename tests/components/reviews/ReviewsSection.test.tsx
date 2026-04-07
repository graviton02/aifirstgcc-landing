import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const useAuthMock = vi.fn();
const useUserRoleMock = vi.fn();
const createReviewMock = vi.fn();

const mockReviewInput = {
  title: "Reliable ops support",
  rating_overall: 4,
  rating_effectiveness: 3,
  rating_value: 2,
  pros:
    "The workflow improved our ticket triage quality and gave us better operational consistency.",
  cons:
    "The first implementation pass took longer than expected and needed better handoff detail.",
  use_case: "Incident triage automation",
};

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/auth/useUserRole", () => ({
  useUserRole: () => useUserRoleMock(),
}));

vi.mock("@/components/reviews/ReviewForm", () => ({
  ReviewForm: ({ onSubmit }: { onSubmit: (value: typeof mockReviewInput) => Promise<void> }) => (
    <button type="button" onClick={() => void onSubmit(mockReviewInput)}>
      Submit mocked review
    </button>
  ),
}));

describe("ReviewsSection", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    useAuthMock.mockReset();
    useUserRoleMock.mockReset();
    createReviewMock.mockReset();

    useAuthMock.mockReturnValue({ isSignedIn: true, isLoaded: true });
    useUserRoleMock.mockReturnValue({ role: "gcc", isLoaded: true });
    useMutationMock.mockReturnValue(createReviewMock);
    createReviewMock.mockResolvedValue("review-1");
  });

  it("shows the sign-up CTA to anonymous visitors", async () => {
    useAuthMock.mockReturnValue({ isSignedIn: false, isLoaded: true });
    useUserRoleMock.mockReturnValue({ role: null, isLoaded: true });
    mockQueries({
      canReview: false,
      canCreate: false,
      canEdit: false,
      reason: "sign_in_required",
      existingReview: null,
    });

    const { ReviewsSection } = await import("@/components/reviews/ReviewsSection");
    render(<ReviewsSection agentId="agent-1" initialData={buildInitialData()} />);

    expect(screen.getByRole("link", { name: /sign up to review/i })).toHaveAttribute(
      "href",
      "/sign-up"
    );
  });

  it("lets eligible GCC users submit a review without a provider request id", async () => {
    mockQueries({
      canReview: true,
      canCreate: true,
      canEdit: false,
      reason: "eligible",
      existingReview: null,
    });

    const { ReviewsSection } = await import("@/components/reviews/ReviewsSection");
    render(<ReviewsSection agentId="agent-1" initialData={buildInitialData()} />);

    fireEvent.click(screen.getByRole("button", { name: /write a review/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit mocked review/i }));

    await waitFor(() =>
      expect(createReviewMock).toHaveBeenCalledWith({
        agent_id: "agent-1",
        ...mockReviewInput,
      })
    );
    expect(createReviewMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ provider_request_id: expect.anything() })
    );
  });

  it("hides the review CTA for provider accounts", async () => {
    useUserRoleMock.mockReturnValue({ role: "provider", isLoaded: true });
    mockQueries({
      canReview: false,
      canCreate: false,
      canEdit: false,
      reason: "provider_account_blocked",
      existingReview: null,
    });

    const { ReviewsSection } = await import("@/components/reviews/ReviewsSection");
    render(<ReviewsSection agentId="agent-1" initialData={buildInitialData()} />);

    expect(screen.queryByRole("button", { name: /write a review/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit your review/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/share your perspective on this agent/i)).not.toBeInTheDocument();
  });

  it("hides the CTA for removed reviews while keeping the status visible", async () => {
    mockQueries({
      canReview: false,
      canCreate: false,
      canEdit: false,
      reason: "review_removed",
      existingReview: {
        _id: "review-1",
        status: "removed",
        title: "Removed review",
        rating_overall: 4,
        rating_effectiveness: 4,
        rating_value: 4,
        pros: mockReviewInput.pros,
        cons: mockReviewInput.cons,
        use_case: mockReviewInput.use_case,
        moderation_reason: "Removed by moderation.",
        reviewed_at: Date.now(),
        updated_at: Date.now(),
      },
    });

    const { ReviewsSection } = await import("@/components/reviews/ReviewsSection");
    render(<ReviewsSection agentId="agent-1" initialData={buildInitialData()} />);

    expect(screen.getByText(/your review status:/i)).toBeInTheDocument();
    expect(screen.getByText("removed")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /write a review/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit your review/i })).not.toBeInTheDocument();
  });
});

function mockQueries(eligibility: unknown) {
  useQueryMock.mockImplementation((_query: unknown, args: { limit?: number }) => {
    if (typeof args?.limit === "number") {
      return buildInitialData();
    }
    return eligibility;
  });
}

function buildInitialData() {
  return {
    summary: {
      overallRating: null,
      reviewCount: 0,
      effectivenessRating: null,
      valueRating: null,
    },
    reviews: [],
    nextCursor: null,
  };
}
