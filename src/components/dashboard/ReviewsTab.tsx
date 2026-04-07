"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  CheckCircle2,
  Loader2,
  MessageSquareText,
  Reply,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { ResponseForm } from "@/components/reviews/ResponseForm";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { getErrorMessage } from "@/lib/report-error";

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

export function ReviewsTab() {
  const [limit, setLimit] = useState(20);
  const [activeResponseReviewId, setActiveResponseReviewId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const data = useQuery(api.reviews.getCompanyReviews, { limit });
  const submitResponse = useMutation(api.reviews.submitResponse);

  if (data === undefined) {
    return (
      <div className="flex items-center gap-2 text-enterprise-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  const handleSubmitResponse = async (reviewId: string, body: string) => {
    setError("");
    setSuccess("");

    try {
      await submitResponse({
        review_id: reviewId as never,
        body,
      });
      setSuccess("Response submitted and will be published shortly.");
      setActiveResponseReviewId(null);
    } catch (submissionError) {
      throw new Error(
        getErrorMessage(
          submissionError,
          "We couldn't save your response. Please try again."
        )
      );
    }
  };

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
          Buyer reviews will appear here once a buyer you've engaged with
          leaves feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Average rating"
          value={
            data.summary.averageRating != null
              ? data.summary.averageRating.toFixed(1)
              : "N/A"
          }
          helper="Across published reviews"
        />
        <SummaryCard
          label="Published reviews"
          value={String(data.summary.totalReviews)}
          helper="Published and visible to buyers"
        />
        <SummaryCard
          label="Response rate"
          value={`${data.summary.responseRate}%`}
          helper="Approved reviews with a provider response"
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      ) : null}

      <div className="space-y-4">
        {data.reviews.map((review: any) => {
          const canRespond =
            review.status === "approved" &&
            review.response?.status !== "approved" &&
            review.response?.status !== "removed";
          const isResponseFormOpen = activeResponseReviewId === review._id;

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
                  <p className="mt-1 text-sm text-enterprise-500">
                    {review.agent?.agent_name ?? "Unknown agent"} • {review.reviewer_label}
                  </p>
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

              {review.response ? (
                <div className="mt-4 rounded-xl border border-enterprise-200 bg-enterprise-50 px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-enterprise-900">
                      Provider response
                    </p>
                    <StatusBadge status={review.response.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-enterprise-700">
                    {review.response.body}
                  </p>
                  <p className="mt-2 text-xs text-enterprise-400">
                    Updated {formatDate(review.response.updated_at ?? review.response.created_at)}
                  </p>
                  {review.response.moderation_reason ? (
                    <p className="mt-2 text-sm text-amber-800">
                      {review.response.moderation_reason}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {review.status === "approved" ? (
                <div className="mt-4 border-t border-enterprise-100 pt-4">
                  {canRespond ? (
                    isResponseFormOpen ? (
                      <ResponseForm
                        initialBody={review.response?.body ?? ""}
                        submitLabel={
                          review.response ? "Update Response" : "Submit Response"
                        }
                        onSubmit={(body) => handleSubmitResponse(review._id, body)}
                        onCancel={() => setActiveResponseReviewId(null)}
                      />
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-enterprise-500">
                          {review.response
                            ? "Update your response and resubmit."
                            : "Reply to this review so buyers can see your perspective."}
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveResponseReviewId(review._id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                        >
                          <Reply className="h-4 w-4" />
                          {review.response ? "Edit Response" : "Respond"}
                        </button>
                      </div>
                    )
                  ) : review.response?.status === "removed" ? (
                    <p className="text-sm text-enterprise-500">
                      This response has been removed and can no longer be edited.
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 border-t border-enterprise-100 pt-4 text-sm text-enterprise-500">
                  You can respond once this review is published.
                </div>
              )}
            </article>
          );
        })}
      </div>

      {data.nextCursor != null ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((current) => current + 20)}
            className="rounded-lg border border-enterprise-200 bg-white px-4 py-2 text-sm font-medium text-enterprise-700 transition-colors hover:bg-enterprise-50"
          >
            Load more reviews
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-enterprise-200 bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-enterprise-950">{value}</p>
      <p className="mt-1 text-sm text-enterprise-500">{helper}</p>
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
