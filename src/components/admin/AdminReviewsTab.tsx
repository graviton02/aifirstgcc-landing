"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  CheckCircle2,
  Loader2,
  MessageSquareText,
  ShieldAlert,
  Trash2,
  XCircle,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { StarRatingDisplay } from "@/components/reviews/StarRating";

type ReviewView =
  | "pending-reviews"
  | "pending-responses"
  | "review-history"
  | "response-history";

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

export function AdminReviewsTab() {
  const [view, setView] = useState<ReviewView>("pending-reviews");
  const [reviewHistoryLimit, setReviewHistoryLimit] = useState(25);
  const [responseHistoryLimit, setResponseHistoryLimit] = useState(25);

  const pendingReviews = useQuery(api.reviews.getPendingReviews, {});
  const pendingResponses = useQuery(api.reviews.getPendingReviewResponses, {});
  const reviewHistory = useQuery(
    api.reviews.getReviewsHistory,
    view === "review-history" ? { limit: reviewHistoryLimit } : "skip"
  );
  const responseHistory = useQuery(
    api.reviews.getReviewResponsesHistory,
    view === "response-history" ? { limit: responseHistoryLimit } : "skip"
  );

  const approveReview = useMutation(api.reviews.approveReview);
  const rejectReview = useMutation(api.reviews.rejectReview);
  const removeReview = useMutation(api.reviews.removeReview);
  const approveReviewResponse = useMutation(api.reviews.approveReviewResponse);
  const rejectReviewResponse = useMutation(api.reviews.rejectReviewResponse);
  const removeReviewResponse = useMutation(api.reviews.removeReviewResponse);

  const navItems = useMemo(
    () => [
      {
        key: "pending-reviews" as const,
        label: "Pending Reviews",
        count: pendingReviews?.length ?? 0,
      },
      {
        key: "pending-responses" as const,
        label: "Pending Responses",
        count: pendingResponses?.length ?? 0,
      },
      {
        key: "review-history" as const,
        label: "Review History",
        count: null,
      },
      {
        key: "response-history" as const,
        label: "Response History",
        count: null,
      },
    ],
    [pendingResponses?.length, pendingReviews?.length]
  );

  const currentPanel =
    view === "pending-reviews"
      ? pendingReviews
      : view === "pending-responses"
        ? pendingResponses
        : view === "review-history"
          ? reviewHistory
          : responseHistory;

  if (currentPanel === undefined) {
    return (
      <div className="flex items-center gap-2 text-enterprise-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  const isEmpty =
    view === "pending-reviews"
      ? !pendingReviews?.length
      : view === "pending-responses"
        ? !pendingResponses?.length
        : view === "review-history"
          ? !reviewHistory?.reviews.length
          : !responseHistory?.responses.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setView(item.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              view === item.key
                ? "bg-primary text-white"
                : "bg-enterprise-100 text-enterprise-600 hover:bg-enterprise-200"
            }`}
          >
            {item.label}
            {item.count != null ? ` (${item.count})` : ""}
          </button>
        ))}
      </div>

      {isEmpty ? (
        <div className="py-16 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent-purple/10">
            <MessageSquareText className="h-12 w-12 text-primary/40" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-enterprise-900">
            Nothing to review here
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-enterprise-500">
            New review moderation items will appear here automatically.
          </p>
        </div>
      ) : null}

      {view === "pending-reviews" && pendingReviews?.length ? (
        <div className="space-y-4">
          {pendingReviews.map((review: any) => (
            <AdminReviewCard
              key={review._id}
              review={review}
              mode="pending"
              onApprove={() => approveReview({ review_id: review._id })}
              onReject={(moderation_reason, admin_notes) =>
                rejectReview({
                  review_id: review._id,
                  moderation_reason,
                  admin_notes,
                })
              }
            />
          ))}
        </div>
      ) : null}

      {view === "pending-responses" && pendingResponses?.length ? (
        <div className="space-y-4">
          {pendingResponses.map((response: any) => (
            <AdminResponseCard
              key={response._id}
              response={response}
              mode="pending"
              onApprove={() =>
                approveReviewResponse({ response_id: response._id })
              }
              onReject={(moderation_reason, admin_notes) =>
                rejectReviewResponse({
                  response_id: response._id,
                  moderation_reason,
                  admin_notes,
                })
              }
            />
          ))}
        </div>
      ) : null}

      {view === "review-history" && reviewHistory?.reviews.length ? (
        <div className="space-y-4">
          {reviewHistory.reviews.map((review: any) => (
            <AdminReviewCard
              key={review._id}
              review={review}
              mode="history"
              onRemove={(moderation_reason, admin_notes) =>
                removeReview({
                  review_id: review._id,
                  moderation_reason,
                  admin_notes,
                })
              }
            />
          ))}
          {reviewHistory.nextCursor != null ? (
            <LoadMoreButton onClick={() => setReviewHistoryLimit((value) => value + 25)} />
          ) : null}
        </div>
      ) : null}

      {view === "response-history" && responseHistory?.responses.length ? (
        <div className="space-y-4">
          {responseHistory.responses.map((response: any) => (
            <AdminResponseCard
              key={response._id}
              response={response}
              mode="history"
              onRemove={(moderation_reason, admin_notes) =>
                removeReviewResponse({
                  response_id: response._id,
                  moderation_reason,
                  admin_notes,
                })
              }
            />
          ))}
          {responseHistory.nextCursor != null ? (
            <LoadMoreButton
              onClick={() => setResponseHistoryLimit((value) => value + 25)}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AdminReviewCard({
  review,
  mode,
  onApprove,
  onReject,
  onRemove,
}: {
  review: any;
  mode: "pending" | "history";
  onApprove?: () => Promise<unknown>;
  onReject?: (moderationReason?: string, adminNotes?: string) => Promise<unknown>;
  onRemove?: (moderationReason?: string, adminNotes?: string) => Promise<unknown>;
}) {
  const [activeAction, setActiveAction] = useState<"reject" | "remove" | null>(null);
  const [moderationReason, setModerationReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | "remove" | null>(
    null
  );

  return (
    <article className="rounded-2xl border border-enterprise-200 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-enterprise-900">
              {review.title}
            </h3>
            <StatusBadge status={review.status} />
          </div>
          <p className="mt-1 text-sm text-enterprise-500">
            {review.agent?.agent_name ?? "Unknown agent"} • {review.reviewer_name}
            {review.reviewer_organization ? `, ${review.reviewer_organization}` : ""}
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
        <DetailBlock label="What went well" value={review.pros} />
        <DetailBlock label="What could improve" value={review.cons} />
      </div>

      {review.moderation_reason ? (
        <ModerationNote label="User-visible reason" value={review.moderation_reason} />
      ) : null}
      {review.admin_notes ? (
        <ModerationNote label="Internal notes" value={review.admin_notes} />
      ) : null}

      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-enterprise-100 pt-4">
        {mode === "pending" ? (
          <>
            <ActionButton
              tone="approve"
              disabled={loading !== null}
              onClick={async () => {
                if (!onApprove) return;
                setLoading("approve");
                try {
                  await onApprove();
                } finally {
                  setLoading(null);
                }
              }}
            >
              {loading === "approve" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Approve
            </ActionButton>
            <ActionButton
              tone="reject"
              disabled={loading !== null}
              onClick={() => setActiveAction(activeAction === "reject" ? null : "reject")}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </ActionButton>
          </>
        ) : review.status !== "removed" ? (
          <ActionButton
            tone="remove"
            disabled={loading !== null}
            onClick={() => setActiveAction(activeAction === "remove" ? null : "remove")}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </ActionButton>
        ) : null}
      </div>

      {activeAction ? (
        <ModerationComposer
          mode={activeAction}
          moderationReason={moderationReason}
          adminNotes={adminNotes}
          loading={loading === activeAction}
          onModerationReasonChange={setModerationReason}
          onAdminNotesChange={setAdminNotes}
          onCancel={() => {
            setActiveAction(null);
            setModerationReason("");
            setAdminNotes("");
          }}
          onSubmit={async () => {
            setLoading(activeAction);
            try {
              if (activeAction === "reject" && onReject) {
                await onReject(moderationReason || undefined, adminNotes || undefined);
              }
              if (activeAction === "remove" && onRemove) {
                await onRemove(moderationReason || undefined, adminNotes || undefined);
              }
              setActiveAction(null);
              setModerationReason("");
              setAdminNotes("");
            } finally {
              setLoading(null);
            }
          }}
        />
      ) : null}
    </article>
  );
}

function AdminResponseCard({
  response,
  mode,
  onApprove,
  onReject,
  onRemove,
}: {
  response: any;
  mode: "pending" | "history";
  onApprove?: () => Promise<unknown>;
  onReject?: (moderationReason?: string, adminNotes?: string) => Promise<unknown>;
  onRemove?: (moderationReason?: string, adminNotes?: string) => Promise<unknown>;
}) {
  const [activeAction, setActiveAction] = useState<"reject" | "remove" | null>(null);
  const [moderationReason, setModerationReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | "remove" | null>(
    null
  );

  return (
    <article className="rounded-2xl border border-enterprise-200 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-enterprise-900">
              Response for {response.agent?.agent_name ?? "Unknown agent"}
            </h3>
            <StatusBadge status={response.status} />
          </div>
          <p className="mt-1 text-sm text-enterprise-500">
            Reviewer: {response.review?.reviewer_name ?? "Unknown reviewer"} •{" "}
            {response.company?.name ?? "Unknown company"}
          </p>
        </div>

        <div className="text-right text-xs text-enterprise-500">
          <p>Submitted {formatDate(response.created_at)}</p>
          {response.reviewed_at ? (
            <p className="mt-1">Reviewed {formatDate(response.reviewed_at)}</p>
          ) : null}
        </div>
      </div>

      {response.review ? (
        <div className="mt-4 rounded-xl border border-enterprise-100 bg-enterprise-50/70 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
            Review context
          </p>
          <p className="mt-2 text-sm font-semibold text-enterprise-900">
            {response.review.title}
          </p>
          <p className="mt-1 text-sm text-enterprise-600">
            {response.review.pros}
          </p>
        </div>
      ) : null}

      <div className="mt-4 rounded-xl border border-enterprise-200 bg-white px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
          Provider response
        </p>
        <p className="mt-2 text-sm leading-6 text-enterprise-700">{response.body}</p>
      </div>

      {response.moderation_reason ? (
        <ModerationNote label="User-visible reason" value={response.moderation_reason} />
      ) : null}
      {response.admin_notes ? (
        <ModerationNote label="Internal notes" value={response.admin_notes} />
      ) : null}

      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-enterprise-100 pt-4">
        {mode === "pending" ? (
          <>
            <ActionButton
              tone="approve"
              disabled={loading !== null}
              onClick={async () => {
                if (!onApprove) return;
                setLoading("approve");
                try {
                  await onApprove();
                } finally {
                  setLoading(null);
                }
              }}
            >
              {loading === "approve" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Approve
            </ActionButton>
            <ActionButton
              tone="reject"
              disabled={loading !== null}
              onClick={() => setActiveAction(activeAction === "reject" ? null : "reject")}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </ActionButton>
          </>
        ) : response.status !== "removed" ? (
          <ActionButton
            tone="remove"
            disabled={loading !== null}
            onClick={() => setActiveAction(activeAction === "remove" ? null : "remove")}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </ActionButton>
        ) : null}
      </div>

      {activeAction ? (
        <ModerationComposer
          mode={activeAction}
          moderationReason={moderationReason}
          adminNotes={adminNotes}
          loading={loading === activeAction}
          onModerationReasonChange={setModerationReason}
          onAdminNotesChange={setAdminNotes}
          onCancel={() => {
            setActiveAction(null);
            setModerationReason("");
            setAdminNotes("");
          }}
          onSubmit={async () => {
            setLoading(activeAction);
            try {
              if (activeAction === "reject" && onReject) {
                await onReject(moderationReason || undefined, adminNotes || undefined);
              }
              if (activeAction === "remove" && onRemove) {
                await onRemove(moderationReason || undefined, adminNotes || undefined);
              }
              setActiveAction(null);
              setModerationReason("");
              setAdminNotes("");
            } finally {
              setLoading(null);
            }
          }}
        />
      ) : null}
    </article>
  );
}

function ModerationComposer({
  mode,
  moderationReason,
  adminNotes,
  loading,
  onModerationReasonChange,
  onAdminNotesChange,
  onCancel,
  onSubmit,
}: {
  mode: "reject" | "remove";
  moderationReason: string;
  adminNotes: string;
  loading: boolean;
  onModerationReasonChange: (value: string) => void;
  onAdminNotesChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}) {
  const title = mode === "reject" ? "Reject item" : "Remove item";

  return (
    <div className="mt-4 rounded-xl border border-enterprise-200 bg-enterprise-50 px-4 py-4">
      <div className="flex items-start gap-2">
        <ShieldAlert className="mt-0.5 h-4 w-4 text-enterprise-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-enterprise-900">{title}</p>
          <p className="mt-1 text-xs text-enterprise-500">
            User-visible reason is shown in the dashboard. Internal notes stay admin-only.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
            User-visible reason
          </label>
          <textarea
            value={moderationReason}
            onChange={(event) => onModerationReasonChange(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-enterprise-200 bg-white px-3 py-2 text-sm text-enterprise-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
            Internal notes
          </label>
          <textarea
            value={adminNotes}
            onChange={(event) => onAdminNotesChange(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-enterprise-200 bg-white px-3 py-2 text-sm text-enterprise-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={onCancel}
          className="rounded-lg border border-enterprise-200 bg-white px-4 py-2 text-sm font-medium text-enterprise-700 transition-colors hover:bg-enterprise-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void onSubmit()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Saving..." : mode === "reject" ? "Confirm Reject" : "Confirm Remove"}
        </button>
      </div>
    </div>
  );
}

function ActionButton({
  tone,
  disabled,
  onClick,
  children,
}: {
  tone: "approve" | "reject" | "remove";
  disabled: boolean;
  onClick: () => void | Promise<void>;
  children: ReactNode;
}) {
  const classes =
    tone === "approve"
      ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      : tone === "reject"
        ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
        : "border border-enterprise-200 bg-enterprise-100 text-enterprise-700 hover:bg-enterprise-200";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => void onClick()}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${classes}`}
    >
      {children}
    </button>
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

function ModerationNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 rounded-lg border border-enterprise-200 bg-enterprise-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-enterprise-700">{value}</p>
    </div>
  );
}

function LoadMoreButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="rounded-lg border border-enterprise-200 bg-white px-4 py-2 text-sm font-medium text-enterprise-700 transition-colors hover:bg-enterprise-50"
      >
        Load more
      </button>
    </div>
  );
}
