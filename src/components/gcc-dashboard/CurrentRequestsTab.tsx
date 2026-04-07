"use client";

import Link from "next/link";
import {
  Building2,
  CheckCircle,
  Clock,
  MessageCircle,
  SquarePen,
  XCircle,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function formatDate(timestamp?: number) {
  if (!timestamp) return "Unknown";

  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { bg: string; icon: React.ReactNode; displayLabel?: string }
  > = {
    pending_admin: {
      bg: "border border-amber-200 bg-amber-50 text-amber-700",
      icon: <Clock className="h-3 w-3" />,
      displayLabel: "Processing",
    },
    approved: {
      bg: "border border-blue-200 bg-blue-50 text-blue-700",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    contacted: {
      bg: "border border-green-200 bg-green-50 text-green-700",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    rejected: {
      bg: "border border-red-200 bg-red-50 text-red-700",
      icon: <XCircle className="h-3 w-3" />,
    },
  };

  const entry = config[status] ?? {
    bg: "bg-enterprise-100 text-enterprise-600",
    icon: null,
  };
  const label = entry.displayLabel ?? status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${entry.bg}`}
    >
      {entry.icon}
      {label}
    </span>
  );
}

export function CurrentRequestsTab() {
  const requests = useQuery(api.gcc.getMyContactRequests);

  if (requests === undefined) {
    return <RequestsSkeleton />;
  }

  if (!requests.length) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent-purple/10">
          <MessageCircle className="h-12 w-12 text-primary/40" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-enterprise-900">
          No contact requests yet
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-enterprise-500">
          When you reach out to providers, your requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request: any) => {
        return (
          <div
            key={request._id}
            className="rounded-2xl border border-enterprise-200 bg-white p-5 shadow-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-enterprise-900">
                    {request.agent?.agent_name ?? "Unknown agent"}
                  </h3>
                  <StatusBadge status={request.status} />
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-enterprise-500">
                  <Building2 className="h-4 w-4" />
                  <span>{request.company?.name ?? "Unknown provider"}</span>
                </div>
              </div>

              <div className="text-right text-xs text-enterprise-500">
                <p>Submitted {formatDate(request.created_at)}</p>
                {request.reviewed_at && (
                  <p className="mt-1">Updated {formatDate(request.reviewed_at)}</p>
                )}
                {request.contacted_at && (
                  <p className="mt-1">
                    Provider contacted on {formatDate(request.contacted_at)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DetailRow label="Use Case" value={request.use_case ?? "Not provided"} />
              <DetailRow label="Timeline" value={request.timeline ?? "Not specified"} />
              <DetailRow
                label="Current Challenge"
                value={request.current_challenge ?? request.message ?? "Not provided"}
              />
              <DetailRow
                label="Expected Outcome"
                value={request.expected_outcome ?? "Not provided"}
              />
            </div>

            {request.admin_notes && (
              <div className="mt-4 rounded-lg border border-enterprise-200 bg-enterprise-50 px-4 py-3 text-sm text-enterprise-700">
                <span className="font-medium text-enterprise-900">
                  Notes:
                </span>{" "}
                {request.admin_notes}
              </div>
            )}

            {request.agent?.slug ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-enterprise-100 pt-4">
                <div className="text-sm text-enterprise-500">
                  {request.review_id ? (
                    <>
                      Review status:{" "}
                      <span className="font-medium capitalize text-enterprise-800">
                        {String(request.review_status ?? "pending").replace(/_/g, " ")}
                      </span>
                    </>
                  ) : (
                    "You can leave a review for this agent from its profile page."
                  )}
                </div>
                <Link
                  href={`/agents/${request.agent.slug}#reviews`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  <SquarePen className="h-4 w-4" />
                  {request.review_id ? "Manage Review" : "Leave Review"}
                </Link>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-enterprise-700">{value}</p>
    </div>
  );
}

function RequestsSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-enterprise-200 bg-white p-5 shadow-card"
        >
          <div className="flex justify-between gap-4">
            <div>
              <div className="h-5 w-40 rounded bg-enterprise-200" />
              <div className="mt-2 h-3 w-32 rounded bg-enterprise-100" />
            </div>
            <div className="h-3 w-24 rounded bg-enterprise-100" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 h-3 w-16 rounded bg-enterprise-100" />
              <div className="h-3 w-full rounded bg-enterprise-100" />
            </div>
            <div>
              <div className="mb-2 h-3 w-16 rounded bg-enterprise-100" />
              <div className="h-3 w-full rounded bg-enterprise-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
