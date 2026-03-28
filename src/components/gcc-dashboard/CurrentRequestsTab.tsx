"use client";

import { Loader2, MessageCircle, Building2 } from "lucide-react";
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
  const styles: Record<string, string> = {
    pending_admin: "bg-amber-100 text-amber-700",
    approved: "bg-blue-100 text-blue-700",
    contacted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const label = status.replace(/_/g, " ");

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        styles[status] ?? "bg-enterprise-100 text-enterprise-600"
      }`}
    >
      {label}
    </span>
  );
}

export function CurrentRequestsTab() {
  const requests = useQuery(api.gcc.getMyContactRequests);

  if (requests === undefined) {
    return (
      <div className="flex items-center gap-2 text-enterprise-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="py-12 text-center text-enterprise-500">
        <MessageCircle className="mx-auto mb-3 h-12 w-12 opacity-50" />
        <p>No contact requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request: any) => (
        <div
          key={request._id}
          className="rounded-2xl border border-enterprise-200 bg-white p-5"
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
                <p className="mt-1">Reviewed {formatDate(request.reviewed_at)}</p>
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
              <span className="font-medium text-enterprise-900">Admin notes:</span>{" "}
              {request.admin_notes}
            </div>
          )}
        </div>
      ))}
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
