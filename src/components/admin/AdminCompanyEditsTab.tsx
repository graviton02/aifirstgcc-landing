"use client";

import { useState } from "react";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  formatFieldLabel,
  getChangedFieldCount,
  PendingEditDiff,
  summarizeFieldValue,
} from "./EditDiffViewer";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function EditCard({
  edit,
  token,
  approveEdit,
  rejectEdit,
}: {
  edit: any;
  token: string;
  approveEdit: any;
  rejectEdit: any;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const handleApprove = async () => {
    setLoading("approve");
    try {
      await approveEdit({ edit_id: edit._id as Id<"companyEdits">, token });
    } finally {
      setLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    setLoading("reject");
    try {
      await rejectEdit({
        edit_id: edit._id as Id<"companyEdits">,
        token,
        notes: rejectionNotes.trim() || undefined,
      });
    } finally {
      setLoading(null);
      setRejecting(false);
      setRejectionNotes("");
    }
  };

  const payload = edit.payload as Record<string, unknown> | undefined;
  const changedFieldCount = getChangedFieldCount(payload);

  return (
    <div className="p-4 bg-white border border-enterprise-200 rounded-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-enterprise-400 shrink-0" />
            <p className="font-medium text-enterprise-900">
              {edit.company?.name ?? "Unknown Company"}
            </p>
            <span className="rounded-full bg-enterprise-100 px-2 py-0.5 text-xs font-medium text-enterprise-600">
              {changedFieldCount} field{changedFieldCount === 1 ? "" : "s"} changed
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="w-3.5 h-3.5 text-enterprise-400 shrink-0" />
            <span className="text-xs text-enterprise-500">
              Submitted {formatDate(edit.created_at)}
            </span>
          </div>

          {changedFieldCount > 0 ? (
            <button
              onClick={() => setExpanded((current) => !current)}
              className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              aria-expanded={expanded}
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {expanded ? "Hide changes" : "Show changes"}
            </button>
          ) : (
            <p className="mt-3 text-sm text-enterprise-500">
              No changed fields captured for this edit.
            </p>
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
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setRejecting(true)}
              disabled={loading !== null}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
              title="Reject"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-4 border-t border-enterprise-100 pt-4">
          <PendingEditDiff currentRecord={edit.company} payload={payload} />
        </div>
      )}

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
              onClick={() => { setRejecting(false); setRejectionNotes(""); }}
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
  const color = status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function AdminCompanyEditsTab({ token }: { token: string }) {
  const [view, setView] = useState<"pending" | "history">("pending");
  const edits = useQuery(api.admin.getPendingCompanyEdits, { token });
  const history = useQuery(
    api.admin.getCompanyEditsHistory,
    view === "history" ? { token } : "skip"
  );
  const approveEdit = useMutation(api.admin.approveCompanyEdit);
  const rejectEdit = useMutation(api.admin.rejectCompanyEdit);

  const pendingCount = edits?.length ?? 0;

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
          {edits === undefined ? (
            <div className="flex items-center gap-2 text-enterprise-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : !edits.length ? (
            <p className="text-enterprise-500 py-8 text-center">No pending company edits.</p>
          ) : (
            <div className="space-y-3">
              {edits.map((edit: any) => (
                <EditCard
                  key={edit._id}
                  edit={edit}
                  token={token}
                  approveEdit={approveEdit}
                  rejectEdit={rejectEdit}
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
              {history.map((edit: any) => {
                const payload = edit.payload as Record<string, unknown> | undefined;
                return (
                  <div key={edit._id} className="p-4 bg-white border border-enterprise-200 rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-enterprise-400 shrink-0" />
                          <p className="font-medium text-enterprise-900">
                            {edit.company?.name ?? "Unknown Company"}
                          </p>
                          <StatusBadge status={edit.status} />
                        </div>
                        {payload && Object.keys(payload).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(payload).map(([key, value]) => (
                              <div key={key} className="flex gap-2 text-sm">
                                <span className="text-enterprise-500 font-medium min-w-[120px] shrink-0">
                                  {formatFieldLabel(key)}:
                                </span>
                                <span className="text-enterprise-800">
                                  {summarizeFieldValue(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {edit.admin_notes && (
                          <p className="text-sm text-enterprise-600 mt-2 italic">
                            Notes: {edit.admin_notes}
                          </p>
                        )}
                        <span className="text-xs text-enterprise-400 mt-2 block">
                          {formatDate(edit.reviewed_at ?? edit.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
