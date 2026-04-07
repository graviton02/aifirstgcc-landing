"use client";

import { useState } from "react";
import { Loader2, CheckCircle, XCircle, Building2, Calendar, Mail, User, Link as LinkIcon } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CompanyLogo } from "@/components/directory/CompanyLogo";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CompanyBadge({ company }: { company: any }) {
  if (!company) {
    return (
      <span className="text-xs text-enterprise-400 italic">Company not found</span>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <CompanyLogo company={company} size="xs" />
      <span className="text-sm font-medium text-enterprise-800">{company.name}</span>
    </div>
  );
}

function ClaimCard({
  claim,
  approveClaim,
  rejectClaim,
}: {
  claim: any;
  approveClaim: any;
  rejectClaim: any;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const handleApprove = () => {
    setConfirming(true);
  };

  const handleApproveConfirm = async () => {
    setLoading("approve");
    try {
      await approveClaim({ claim_id: claim._id as Id<"claimRequests"> });
    } finally {
      setLoading(null);
      setConfirming(false);
    }
  };

  const handleApproveCancel = () => {
    setConfirming(false);
  };

  const handleRejectClick = () => {
    setRejecting(true);
  };

  const handleRejectConfirm = async () => {
    setLoading("reject");
    try {
      await rejectClaim({
        claim_id: claim._id as Id<"claimRequests">,
        notes: rejectionNotes.trim() || undefined,
      });
    } finally {
      setLoading(null);
      setRejecting(false);
      setRejectionNotes("");
    }
  };

  const handleRejectCancel = () => {
    setRejecting(false);
    setRejectionNotes("");
  };

  return (
    <div className="p-4 bg-white border border-enterprise-200 rounded-xl">
      <div className="flex items-start justify-between gap-4">
        {/* Left: claim details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-enterprise-400 shrink-0" />
            <p className="font-medium text-enterprise-900">{claim.claimant_name}</p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Mail className="w-4 h-4 text-enterprise-400 shrink-0" />
            <a
              href={`mailto:${claim.claimant_email}`}
              className="text-sm text-enterprise-600 hover:text-primary hover:underline"
            >
              {claim.claimant_email}
            </a>
          </div>

          {claim.claimant_linkedin ? (
            <div className="flex items-center gap-2 mt-1">
              <LinkIcon className="w-4 h-4 text-enterprise-400 shrink-0" />
              <a
                href={claim.claimant_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-enterprise-600 hover:text-primary hover:underline"
              >
                LinkedIn profile
              </a>
            </div>
          ) : null}

          <div className="flex items-center gap-2 mt-2">
            <Building2 className="w-4 h-4 text-enterprise-400 shrink-0" />
            <CompanyBadge company={claim.company} />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Calendar className="w-3.5 h-3.5 text-enterprise-400 shrink-0" />
            <span className="text-xs text-enterprise-500">
              Submitted {formatDate(claim.created_at)}
            </span>
          </div>
        </div>

        {/* Right: action buttons */}
        {!rejecting && !confirming && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 transition-colors"
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={handleRejectClick}
              disabled={loading !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Approve confirmation UI */}
      {confirming && (
        <div className="mt-3 pt-3 border-t border-enterprise-100">
          <p className="text-sm text-enterprise-700 mb-3">
            Approve this claim from <span className="font-medium">{claim.claimant_name}</span> for{" "}
            <span className="font-medium">{claim.company?.name ?? "this company"}</span>?
            This will send them an activation email.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleApproveCancel}
              disabled={loading !== null}
              className="px-3 py-1.5 text-sm text-enterprise-600 hover:bg-enterprise-50 rounded-lg disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApproveConfirm}
              disabled={loading !== null}
              className="px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {loading === "approve" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              Confirm Approve
            </button>
          </div>
        </div>
      )}

      {/* Rejection notes UI */}
      {rejecting && (
        <div className="mt-3 pt-3 border-t border-enterprise-100">
          <label className="block text-sm font-medium text-enterprise-700 mb-1">
            Rejection notes (optional)
          </label>
          <textarea
            value={rejectionNotes}
            onChange={(e) => setRejectionNotes(e.target.value)}
            placeholder="Reason for rejection..."
            rows={3}
            className="w-full rounded-lg border border-enterprise-200 bg-enterprise-50 px-3 py-2 text-sm text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={handleRejectCancel}
              disabled={loading !== null}
              className="px-3 py-1.5 text-sm text-enterprise-600 hover:bg-enterprise-50 rounded-lg disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectConfirm}
              disabled={loading !== null}
              className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {loading === "reject" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
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
    activated: "bg-blue-100 text-blue-700",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? "bg-enterprise-100 text-enterprise-600"}`}>
      {label}
    </span>
  );
}

export function AdminClaimsTab() {
  const [view, setView] = useState<"pending" | "history">("pending");
  const claims = useQuery(api.admin.getPendingClaims, {});
  const history = useQuery(
    api.admin.getClaimsHistory,
    view === "history" ? {} : "skip"
  );
  const approveClaim = useAction(api.admin.approveClaim);
  const rejectClaim = useMutation(api.admin.rejectClaim);

  const pendingCount = claims?.length ?? 0;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView("pending")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            view === "pending"
              ? "bg-primary text-white"
              : "bg-enterprise-100 text-enterprise-600 hover:bg-enterprise-200"
          }`}
        >
          Pending {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          onClick={() => setView("history")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
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
          {claims === undefined ? (
            <div className="flex items-center gap-2 text-enterprise-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : !claims.length ? (
            <p className="text-enterprise-500 py-8 text-center">No pending claims.</p>
          ) : (
            <div className="space-y-3">
              {claims.map((claim: any) => (
                <ClaimCard
                  key={claim._id}
                  claim={claim}
                  approveClaim={approveClaim}
                  rejectClaim={rejectClaim}
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
            <p className="text-enterprise-500 py-8 text-center">No history yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((claim: any) => (
                <div key={claim._id} className="p-4 bg-white border border-enterprise-200 rounded-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-enterprise-400 shrink-0" />
                        <p className="font-medium text-enterprise-900">{claim.claimant_name}</p>
                        <StatusBadge status={claim.status} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-enterprise-400 shrink-0" />
                        <span className="text-sm text-enterprise-600">{claim.claimant_email}</span>
                      </div>
                      {claim.claimant_linkedin ? (
                        <div className="flex items-center gap-2 mt-1">
                          <LinkIcon className="w-4 h-4 text-enterprise-400 shrink-0" />
                          <a
                            href={claim.claimant_linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-enterprise-600 hover:text-primary hover:underline"
                          >
                            LinkedIn profile
                          </a>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2 mt-2">
                        <Building2 className="w-4 h-4 text-enterprise-400 shrink-0" />
                        <CompanyBadge company={claim.company} />
                      </div>
                      {claim.admin_notes && (
                        <p className="text-sm text-enterprise-600 mt-2 italic">
                          Notes: {claim.admin_notes}
                        </p>
                      )}
                      <span className="text-xs text-enterprise-400 mt-2 block">
                        {formatDate(claim.reviewed_at ?? claim.created_at)}
                      </span>
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
