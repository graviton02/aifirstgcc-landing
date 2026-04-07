"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useUserRole } from "@/auth/useUserRole";
import { Button } from "@/components/ui/button";
import { PublicReviewCard } from "@/components/reviews/PublicReviewCard";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { getErrorMessage } from "@/lib/report-error";

type AgentPublicReviewData = {
  summary: {
    overallRating: number | null;
    reviewCount: number;
    effectivenessRating: number | null;
    valueRating: number | null;
  };
  reviews: Array<{
    _id: string;
    reviewer_label: string;
    rating_overall: number;
    rating_effectiveness: number;
    rating_value: number;
    title: string;
    pros: string;
    cons: string;
    use_case?: string;
    created_at: number;
    updated_at: number;
    response?: {
      body: string;
      created_at: number;
      updated_at: number;
    } | null;
  }>;
  nextCursor: number | null;
} | null;

export function ReviewsSection({
  agentId,
  initialData,
}: {
  agentId: string;
  initialData: AgentPublicReviewData;
}) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { role, isLoaded: roleLoaded } = useUserRole();
  const [limit, setLimit] = useState(5);
  const [formOpen, setFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const publicData = useQuery(api.reviews.getAgentPublicData, {
    agent_id: agentId as never,
    limit,
  });
  const eligibility = useQuery(api.reviews.getReviewEligibility, {
    agent_id: agentId as never,
  });
  const createReview = useMutation(api.reviews.createReview);
  const updateReview = useMutation(api.reviews.updateMyReview);

  const data = publicData === undefined ? initialData : publicData;
  const existingReview = eligibility?.existingReview ?? null;

  const cta = useMemo(() => {
    if (!authLoaded || (isSignedIn && !roleLoaded)) {
      return {
        kind: "loading" as const,
        label: "Loading...",
        helper: "",
      };
    }

    if (!isSignedIn) {
      return {
        kind: "link" as const,
        label: "Sign Up to Review",
        helper: "Create an account to leave a review.",
        href: "/sign-up",
      };
    }

    if (role === "provider" || eligibility?.reason === "provider_account_blocked") {
      return {
        kind: "hidden" as const,
        label: "",
        helper: "",
      };
    }

    if (eligibility?.canReview) {
      return {
        kind: "button" as const,
        label: eligibility.canEdit ? "Edit Your Review" : "Write a Review",
        helper: eligibility.canEdit
          ? "You already have a review for this agent."
          : "Share your perspective on this agent.",
      };
    }

    if (eligibility?.reason === "gcc_profile_required") {
      return {
        kind: "link" as const,
        label: "Complete Your Profile",
        helper: "Complete your profile setup before leaving a review.",
        href: "/onboarding",
      };
    }

    if (eligibility?.reason === "review_removed") {
      return {
        kind: "hidden" as const,
        label: "",
        helper: "",
      };
    }

    return {
      kind: "hidden" as const,
      label: "",
      helper: "",
    };
  }, [authLoaded, eligibility, isSignedIn, role, roleLoaded]);

  const handleSubmit = async (value: {
    title: string;
    rating_overall: number;
    rating_effectiveness: number;
    rating_value: number;
    pros: string;
    cons: string;
    use_case?: string;
  }) => {
    try {
      if (eligibility?.canEdit && existingReview) {
        await updateReview({
          review_id: existingReview._id as never,
          ...value,
        });
      } else if (eligibility?.canCreate) {
        await createReview({
          agent_id: agentId as never,
          ...value,
        });
      } else {
        throw new Error("Reviews are not available for this agent yet.");
      }

      setSuccessMessage(
        "Your review has been submitted and will be published shortly."
      );
      setFormOpen(false);
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "We couldn't save your review. Please try again.")
      );
    }
  };

  return (
    <section id="reviews" className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-enterprise-200 bg-enterprise-50/50 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Reviews
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-enterprise-950">
            GCC buyer feedback
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-enterprise-600">
            Reviews are written by GCC buyers and published after moderation.
          </p>
        </div>

        <div className="md:max-w-xs md:text-right">
          {cta.kind === "link" ? (
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              <MessageSquarePlus className="h-4 w-4" />
              {cta.label}
            </Link>
          ) : cta.kind === "button" ? (
            <Button type="button" onClick={() => setFormOpen((current) => !current)}>
              <MessageSquarePlus className="h-4 w-4" />
              {cta.label}
            </Button>
          ) : cta.kind === "loading" ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-xl bg-enterprise-200 px-4 py-2.5 text-sm font-medium text-enterprise-500"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              {cta.label}
            </button>
          ) : null}
          {cta.helper ? (
            <p className="mt-2 text-xs leading-5 text-enterprise-500">{cta.helper}</p>
          ) : null}
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {existingReview ? (
        <div className="rounded-xl border border-enterprise-200 bg-white px-4 py-4">
          <p className="text-sm font-semibold text-enterprise-900">
            Your review status:{" "}
            <span className="capitalize text-primary">{existingReview.status}</span>
          </p>
          {existingReview.moderation_reason ? (
            <p className="mt-2 text-sm text-enterprise-600">
              {existingReview.moderation_reason}
            </p>
          ) : null}
        </div>
      ) : null}

      {formOpen ? (
        <ReviewForm
          initialValue={existingReview ?? undefined}
          submitLabel={existingReview ? "Update Review" : "Submit Review"}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      ) : null}

      {!data || data.reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-enterprise-200 bg-white px-6 py-12 text-center">
          <p className="text-lg font-semibold text-enterprise-900">No reviews yet</p>
          <p className="mt-2 text-sm text-enterprise-500">
            Buyer reviews will appear here once published.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.reviews.map((review) => (
            <PublicReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}

      {data?.nextCursor != null ? (
        <div className="flex justify-center">
          <Button type="button" variant="secondary" onClick={() => setLimit((current) => current + 5)}>
            Load more reviews
          </Button>
        </div>
      ) : null}
    </section>
  );
}
