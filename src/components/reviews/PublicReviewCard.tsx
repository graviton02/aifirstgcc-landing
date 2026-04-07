"use client";

import { ChatCircleDots } from "@phosphor-icons/react";
import { StarRatingDisplay } from "@/components/reviews/StarRating";

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PublicReviewCard({
  review,
}: {
  review: {
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
    response?: {
      body: string;
      created_at: number;
    } | null;
  };
}) {
  return (
    <article className="rounded-2xl border border-enterprise-200 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-enterprise-900">{review.title}</h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              GCC Review
            </span>
          </div>
          <p className="mt-1 text-sm text-enterprise-500">
            {review.reviewer_label}
          </p>
        </div>
        <p className="text-xs text-enterprise-400">{formatDate(review.created_at)}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <RatingMetric label="Overall" value={review.rating_overall} />
        <RatingMetric label="Effectiveness" value={review.rating_effectiveness} />
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
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
            What went well
          </p>
          <p className="mt-2 text-sm leading-6 text-enterprise-700">{review.pros}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
            What could improve
          </p>
          <p className="mt-2 text-sm leading-6 text-enterprise-700">{review.cons}</p>
        </div>
      </div>

      {review.response ? (
        <div className="mt-5 rounded-xl border border-enterprise-200 bg-enterprise-50 px-4 py-4">
          <div className="flex items-center gap-2 text-enterprise-800">
            <ChatCircleDots weight="duotone" className="h-4 w-4" />
            <p className="text-sm font-semibold">Provider response</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-enterprise-700">{review.response.body}</p>
          <p className="mt-2 text-xs text-enterprise-400">
            Published {formatDate(review.response.created_at)}
          </p>
        </div>
      ) : null}
    </article>
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
        <span className="text-sm font-medium text-enterprise-800">{value.toFixed(1)}</span>
      </div>
    </div>
  );
}
