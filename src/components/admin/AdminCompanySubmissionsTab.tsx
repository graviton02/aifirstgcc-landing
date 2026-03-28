"use client";

import { useState } from "react";
import { Loader2, CheckCircle, XCircle, Building2, Calendar, Globe, MapPin, Store } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { AgentReviewDetails } from "./AgentReviewDetails";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SubmissionCard({
  submission,
  token,
  approveSubmission,
  rejectSubmission,
}: {
  submission: any;
  token: string;
  approveSubmission: any;
  rejectSubmission: any;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const handleApprove = async () => {
    setLoading("approve");
    try {
      await approveSubmission({
        submission_id: submission._id as Id<"companySubmissions">,
        token,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading("reject");
    try {
      await rejectSubmission({
        submission_id: submission._id as Id<"companySubmissions">,
        token,
        notes: rejectionNotes.trim() || undefined,
      });
    } finally {
      setLoading(null);
      setRejecting(false);
      setRejectionNotes("");
    }
  };

  return (
    <div className="rounded-xl border border-enterprise-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-enterprise-400" />
            <p className="font-semibold text-enterprise-900">{submission.company_name}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-enterprise-600">
            <Globe className="h-4 w-4 text-enterprise-400" />
            <a href={submission.website} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">
              {submission.website}
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm text-enterprise-600">
            <MapPin className="h-4 w-4 text-enterprise-400" />
            <span>{submission.headquarters}</span>
          </div>

          <p className="text-sm text-enterprise-700">{submission.description}</p>

          <div className="flex flex-wrap gap-2">
            {submission.primary_verticals.map((vertical: string) => (
              <span
                key={vertical}
                className="rounded-full bg-enterprise-100 px-2 py-0.5 text-xs font-medium text-enterprise-600"
              >
                {vertical}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-enterprise-500">
            <Calendar className="h-3.5 w-3.5 text-enterprise-400" />
            <span>Submitted {formatDate(submission.created_at)}</span>
          </div>

          <p className="text-xs text-enterprise-500">
            Contact email: <span className="font-medium text-enterprise-700">{submission.contact_email}</span>
          </p>

          {submission.initial_agent ? (
            <div className="rounded-xl border border-enterprise-200 bg-enterprise-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-enterprise-500">
                First Agent To Queue
              </p>
              <p className="mt-1 font-medium text-enterprise-900">
                {submission.initial_agent.agent_name}
              </p>
              {submission.initial_agent.tagline && (
                <p className="text-sm text-enterprise-600 mt-1">
                  {submission.initial_agent.tagline}
                </p>
              )}
              <AgentReviewDetails
                agent={submission.initial_agent}
                validationErrors={submission.initialAgentValidationErrors}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              No first agent is attached to this legacy company submission.
            </div>
          )}
        </div>

        {!rejecting && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 transition-colors"
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
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
              title="Reject"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {rejecting && (
        <div className="mt-4 border-t border-enterprise-100 pt-4">
          <label className="mb-1 block text-sm font-medium text-enterprise-700">
            Rejection notes (optional)
          </label>
          <textarea
            rows={3}
            value={rejectionNotes}
            onChange={(event) => setRejectionNotes(event.target.value)}
            placeholder="Explain what needs to be fixed before resubmission."
            className="w-full rounded-lg border border-enterprise-200 bg-enterprise-50 px-3 py-2 text-sm text-enterprise-900"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                setRejecting(false);
                setRejectionNotes("");
              }}
              disabled={loading !== null}
              className="rounded-lg px-3 py-1.5 text-sm text-enterprise-600 hover:bg-enterprise-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={loading !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-enterprise-100 text-enterprise-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function AdminCompanySubmissionsTab({ token }: { token: string }) {
  const [view, setView] = useState<"pending" | "history">("pending");
  const pending = useQuery(api.admin.getPendingCompanySubmissions, { token });
  const history = useQuery(
    api.admin.getCompanySubmissionsHistory,
    view === "history" ? { token } : "skip"
  );
  const approveSubmission = useMutation(api.admin.approveCompanySubmission);
  const rejectSubmission = useMutation(api.admin.rejectCompanySubmission);

  const pendingCount = pending?.length ?? 0;

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
          {pending === undefined ? (
            <div className="flex items-center gap-2 text-enterprise-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : !pending.length ? (
            <p className="py-8 text-center text-enterprise-500">No pending company submissions.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((submission: any) => (
                <SubmissionCard
                  key={submission._id}
                  submission={submission}
                  token={token}
                  approveSubmission={approveSubmission}
                  rejectSubmission={rejectSubmission}
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
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : !history.length ? (
            <p className="py-8 text-center text-enterprise-500">No company submission history yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((submission: any) => (
                <div key={submission._id} className="rounded-xl border border-enterprise-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-enterprise-400" />
                        <p className="font-semibold text-enterprise-900">{submission.company_name}</p>
                        <StatusBadge status={submission.status} />
                      </div>
                      <p className="mt-2 text-sm text-enterprise-700">{submission.description}</p>
                      <p className="mt-2 text-xs text-enterprise-500">
                        Reviewed {formatDate(submission.reviewed_at ?? submission.created_at)}
                      </p>
                      {submission.admin_notes && (
                        <p className="mt-2 text-sm text-enterprise-600">
                          Admin notes: {submission.admin_notes}
                        </p>
                      )}
                      {submission.createdCompany && (
                        <p className="mt-2 text-sm text-green-700">
                          Created company: {submission.createdCompany.name}
                        </p>
                      )}
                      {submission.initialAgentSubmission && (
                        <p className="mt-2 text-sm text-enterprise-600">
                          First agent submission status: {submission.initialAgentSubmission.submission_status}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
