"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import {
  Building2,
  ExternalLink,
  Loader2,
  MessageSquareText,
  SquarePen,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { StarRatingDisplay } from "@/components/reviews/StarRating";

function formatDate(timestamp?: number) {
  if (!timestamp) return "Unknown";

  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    pending: "border border-amber-200 bg-amber-50 text-amber-700",
    approved: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected: "border border-red-200 bg-red-50 text-red-700",
    removed: "border border-enterprise-200 bg-enterprise-100 text-enterprise-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes[status] ?? "border border-enterprise-200 bg-enterprise-100 text-enterprise-600"}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function MyReviewsTab() {
  const [limit, setLimit] = useState(10);
  const data = useQuery(api.reviews.getMyReviews, { limit });

  if (data === undefined) {
    return (
      <div className="flex items-center gap-2 text-enterprise-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!data.reviews.length) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent-purple/10">
          <MessageSquareText className="h-12 w-12 text-primary/40" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-enterprise-900">
          No reviews yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-enterprise-500">
          Leave a review from any claimed agent page when you're ready to share feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.reviews.map((review: any) => {
        const listingHref = review.agent?.slug
          ? `/agents/${review.agent.slug}#reviews`
          : null;

        return (
          <article
            key={review._id}
            className="rounded-2xl border border-enterprise-200 bg-white p-5 shadow-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-enterprise-900">
                    {review.title}
                  </h3>
                  <StatusBadge status={review.status} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-enterprise-500">
                  <span>{review.agent?.agent_name ?? "Unknown agent"}</span>
                  {review.company?.name ? (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {review.company.name}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="text-right text-xs text-enterprise-500">
                <p>Submitted {formatDate(review.created_at)}</p>
                {review.reviewed_at ? (
                  <p className="mt-1">Reviewed {formatDate(review.reviewed_at)}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <RatingMetric label="Overall" value={review.rating_overall} />
              <RatingMetric
                label="Effectiveness"
                value={review.rating_effectiveness}
              />
              <RatingMetric label="Value" value={review.rating_value} />
            </div>

            {review.use_case ? (
              <div className="mt-4 rounded-lg border border-enterprise-100 bg-enterprise-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
                  Use case
                </p>
                <p className="mt-1 text-sm text-enterprise-700">{review.use_case}</p>
              </div>
            ) : null}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DetailBlock label="What went well" value={review.pros} />
              <DetailBlock label="What could improve" value={review.cons} />
            </div>

            {review.moderation_reason ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {review.moderation_reason}
              </div>
            ) : null}

            {review.response?.status === "approved" ? (
              <div className="mt-4 rounded-xl border border-enterprise-200 bg-enterprise-50 px-4 py-4">
                <p className="text-sm font-semibold text-enterprise-900">
                  Provider response
                </p>
                <p className="mt-2 text-sm leading-6 text-enterprise-700">
                  {review.response.body}
                </p>
              </div>
            ) : null}

            {listingHref ? (
              <div className="mt-4 flex justify-end border-t border-enterprise-100 pt-4">
                <Link
                  href={listingHref}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  {review.status === "approved" ? (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      View listing
                    </>
                  ) : (
                    <>
                      <SquarePen className="h-4 w-4" />
                      Edit review
                    </>
                  )}
                </Link>
              </div>
            ) : null}
          </article>
        );
      })}

      {data.nextCursor != null ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((current) => current + 10)}
            className="rounded-lg border border-enterprise-200 bg-white px-4 py-2 text-sm font-medium text-enterprise-700 transition-colors hover:bg-enterprise-50"
          >
            Load more reviews
          </button>
        </div>
      ) : null}
    </div>
  );
}

function RatingMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-enterprise-100 bg-enterprise-50/60 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <StarRatingDisplay value={value} />
        <span className="text-sm font-medium text-enterprise-800">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-enterprise-700">{value}</p>
    </div>
  );
}
