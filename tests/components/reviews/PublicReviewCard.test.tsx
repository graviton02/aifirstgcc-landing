import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PublicReviewCard } from "@/components/reviews/PublicReviewCard";

describe("PublicReviewCard", () => {
  it("renders the anonymous GCC label without exposing stored reviewer identity", () => {
    render(
      <PublicReviewCard
        review={
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
            created_at: Date.now(),
            response: null,
          } as any
        }
      />
    );

    expect(screen.getByText("Anonymous GCC Buyer")).toBeInTheDocument();
    expect(screen.getByText("GCC Review")).toBeInTheDocument();
    expect(screen.queryByText("Verified Buyer")).not.toBeInTheDocument();
    expect(screen.queryByText("Priya Sharma")).not.toBeInTheDocument();
    expect(screen.queryByText("Global Capability Center")).not.toBeInTheDocument();
  });
});
