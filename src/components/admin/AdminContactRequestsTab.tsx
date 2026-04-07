"use client";

import { useState } from "react";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Mail,
  Bot,
  Calendar,
  Building2,
  Target,
} from "lucide-react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/report-error";

function formatDate(timestamp?: number): string {
  if (!timestamp) return "Unknown";

  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    approved: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
    contacted: "bg-green-100 text-green-700",
    archived: "bg-enterprise-100 text-enterprise-600",
  };
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        colors[status] ?? "bg-enterprise-100 text-enterprise-600"
      }`}
    >
      {label}
    </span>
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

function ContactRequestCard({
  request,
  approveRequest,
  rejectRequest,
}: {
  request: any;
  approveRequest: any;
  rejectRequest: any;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const handleApprove = async () => {
    setError("");
    setLoading("approve");
    try {
      await approveRequest({
        request_id: request._id as Id<"providerRequests">,
      });
    } catch (actionError) {
      setError(
        getErrorMessage(
          actionError,
          "We couldn't approve the contact request."
        )
      );
    } finally {
      setLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    setError("");
    setLoading("reject");
    try {
      await rejectRequest({
        request_id: request._id as Id<"providerRequests">,
        notes: rejectionNotes.trim() || undefined,
      });
      setRejecting(false);
      setRejectionNotes("");
    } catch (actionError) {
      setError(
        getErrorMessage(
          actionError,
          "We couldn't reject the contact request."
        )
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-2xl border border-enterprise-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Bot className="h-4 w-4 shrink-0 text-enterprise-400" />
            <span className="text-base font-semibold text-enterprise-900">
              {request.agent?.agent_name ?? "Unknown agent"}
            </span>
            {request.company?.name && (
              <span className="text-sm text-enterprise-500">
                • {request.company.name}
              </span>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
                GCC Contact
              </p>
              <p className="mt-1 text-sm font-medium text-enterprise-900">
                {request.gcc_name ?? "Unknown GCC"}
              </p>
              <a
                href={`mailto:${request.gcc_email ?? request.gcc_user_email ?? ""}`}
                className="mt-1 inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                {request.gcc_email ?? request.gcc_user_email ?? "No email"}
              </a>
              <div className="mt-1 flex items-center gap-2 text-sm text-enterprise-600">
                <Building2 className="h-4 w-4" />
                <span>
                  {request.gcc_organization ?? "Unknown organization"} •{" "}
                  {request.gcc_industry ?? "Unknown industry"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
                Submitted
              </p>
              <div className="mt-1 flex items-center gap-2 text-sm text-enterprise-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(request.created_at)}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-enterprise-600">
                <Target className="h-4 w-4" />
                <span>{request.timeline ?? "No timeline provided"}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <DetailRow label="Use Case" value={request.use_case ?? "Not provided"} />
            <DetailRow
              label="Current Challenge"
              value={request.current_challenge ?? request.message ?? "Not provided"}
            />
            <DetailRow
              label="Expected Outcome"
              value={request.expected_outcome ?? "Not provided"}
            />
            <DetailRow
              label="Request Source"
              value={
                request.request_source === "company_profile"
                  ? "Company profile"
                  : "Agent detail"
              }
            />
          </div>
        </div>

        {!rejecting && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
              title="Approve"
            >
              {loading === "approve" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => setRejecting(true)}
              disabled={loading !== null}
              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              title="Reject"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {rejecting && (
        <div className="mt-4 border-t border-enterprise-100 pt-4">
          <label className="mb-1 block text-sm font-medium text-enterprise-700">
            Rejection notes (optional)
          </label>
          <textarea
            value={rejectionNotes}
            onChange={(event) => setRejectionNotes(event.target.value)}
            placeholder="Reason for rejection..."
            rows={3}
            className="w-full resize-none rounded-lg border border-enterprise-200 bg-enterprise-50 px-3 py-2 text-sm text-enterprise-900 placeholder:text-enterprise-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => {
                setRejecting(false);
                setRejectionNotes("");
              }}
              disabled={loading !== null}
              className="rounded-lg px-3 py-1.5 text-sm text-enterprise-600 transition-colors hover:bg-enterprise-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectConfirm}
              disabled={loading !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {loading === "reject" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              Confirm Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminContactRequestsTab() {
  const [view, setView] = useState<"pending" | "history">("pending");
  const requests = useQuery(api.admin.getPendingContactRequests, {});
  const history = useQuery(
    api.admin.getContactRequestsHistory,
    view === "history" ? {} : "skip"
  );
  const approveRequest = useAction(api.admin.approveContactRequest);
  const rejectRequest = useAction(api.admin.rejectContactRequest);

  const pendingCount = requests?.length ?? 0;

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setView("pending")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            view === "pending"
              ? "bg-primary text-white"
              : "bg-enterprise-100 text-enterprise-600 hover:bg-enterprise-200"
          }`}
        >
          Pending {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          onClick={() => setView("history")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            view === "history"
              ? "bg-primary text-white"
              : "bg-enterprise-100 text-enterprise-600 hover:bg-enterprise-200"
          }`}
        >
          History
        </button>
      </div>

      {view === "pending" && (
        <>
          {requests === undefined ? (
            <div className="flex items-center gap-2 text-enterprise-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : !requests.length ? (
            <p className="py-8 text-center text-enterprise-500">
              No pending contact requests.
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request: any) => (
                <ContactRequestCard
                  key={request._id}
                  request={request}
                  approveRequest={approveRequest}
                  rejectRequest={rejectRequest}
                />
              ))}
            </div>
          )}
        </>
      )}

      {view === "history" && (
        <>
          {history === undefined ? (
            <div className="flex items-center gap-2 text-enterprise-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : !history.length ? (
            <p className="py-8 text-center text-enterprise-500">No history yet.</p>
          ) : (
            <div className="space-y-4">
              {history.map((request: any) => (
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
                      <p className="mt-1 text-sm text-enterprise-500">
                        {request.company?.name ?? "Unknown provider"} • GCC:{" "}
                        {request.gcc_name ?? request.gcc_email ?? request.gcc_user_email}
                      </p>
                    </div>

                    <div className="text-right text-xs text-enterprise-500">
                      <p>Submitted {formatDate(request.created_at)}</p>
                      {request.reviewed_at && (
                        <p className="mt-1">
                          Reviewed {formatDate(request.reviewed_at)}
                        </p>
                      )}
                      {request.contacted_at && (
                        <p className="mt-1">
                          Contacted {formatDate(request.contacted_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
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
                    <p className="mt-4 rounded-lg border border-enterprise-200 bg-enterprise-50 px-4 py-3 text-sm text-enterprise-700">
                      <span className="font-medium text-enterprise-900">Notes:</span>{" "}
                      {request.admin_notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
