"use client";

import { useState } from "react";
import { Loader2, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
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

function AgentCard({
  agent,
  token,
  approve,
  reject,
  requestChanges,
}: {
  agent: any;
  token: string;
  approve: any;
  reject: any;
  requestChanges: any;
}) {
  const [expanded, setExpanded] = useState(false);
  const [action, setAction] = useState<"reject" | "changes" | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | "changes" | null>(null);

  const handleApprove = async () => {
    setLoading("approve");
    try {
      await approve({ submission_id: agent._id as Id<"agentSubmissions">, token });
    } finally {
      setLoading(null);
    }
  };

  const handleConfirm = async () => {
    const actionType = action;
    setLoading(actionType);
    try {
      if (actionType === "reject") {
        await reject({
          submission_id: agent._id as Id<"agentSubmissions">,
          token,
          notes: notes.trim() || undefined,
        });
      } else {
        await requestChanges({
          submission_id: agent._id as Id<"agentSubmissions">,
          token,
          notes: notes.trim() || undefined,
        });
      }
    } finally {
      setLoading(null);
      setAction(null);
      setNotes("");
    }
  };

  return (
    <div className="p-4 bg-white border border-enterprise-200 rounded-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-enterprise-900">{agent.agent_name}</p>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {agent.category}
            </span>
          </div>
          {agent.tagline && <p className="text-sm text-enterprise-600 mt-0.5">{agent.tagline}</p>}
          {agent.company?.name && (
            <p className="text-xs text-enterprise-500 mt-1">by {agent.company.name}</p>
          )}
          <p className="text-sm text-enterprise-700 mt-2 line-clamp-2">{agent.description}</p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-2 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Show less" : "Show more"}
          </button>

          {expanded && (
            <AgentReviewDetails
              agent={agent}
              validationErrors={agent.validation_errors}
            />
          )}

          <div className="flex items-center gap-2 mt-2">
            <Calendar className="w-3.5 h-3.5 text-enterprise-400 shrink-0" />
            <span className="text-xs text-enterprise-500">
              Submitted {formatDate(agent.created_at)}
            </span>
          </div>
        </div>

        {!action && (
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
              onClick={() => setAction("changes")}
              disabled={loading !== null}
              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-50 transition-colors"
              title="Request Changes"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setAction("reject")}
              disabled={loading !== null}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
              title="Reject"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {action && (
        <div className="mt-3 pt-3 border-t border-enterprise-100">
          <label className="block text-sm font-medium text-enterprise-700 mb-1">
            {action === "reject" ? "Rejection notes (optional)" : "Change request notes (optional)"}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={action === "reject" ? "Reason for rejection..." : "What needs to change..."}
            rows={3}
            className="w-full rounded-lg border border-enterprise-200 bg-enterprise-50 px-3 py-2 text-sm text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={() => { setAction(null); setNotes(""); }}
              disabled={loading !== null}
              className="px-3 py-1.5 text-sm text-enterprise-600 hover:bg-enterprise-50 rounded-lg disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading !== null}
              className={`px-3 py-1.5 text-sm text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5 ${
                action === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : action === "reject" ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              {action === "reject" ? "Confirm Reject" : "Request Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryAgentCard({ agent }: { agent: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 bg-white border border-enterprise-200 rounded-xl">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-enterprise-900">{agent.agent_name}</p>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {agent.category}
        </span>
        <StatusBadge status={agent.submission_status} />
      </div>
      {agent.tagline && <p className="text-sm text-enterprise-600 mt-0.5">{agent.tagline}</p>}
      {agent.company?.name && (
        <p className="text-xs text-enterprise-500 mt-1">by {agent.company.name}</p>
      )}
      <p className="text-sm text-enterprise-700 mt-2 line-clamp-2">{agent.description}</p>
      <button
        onClick={() => setExpanded((current) => !current)}
        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-2 transition-colors"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? "Show less" : "Show more"}
      </button>
      {expanded && (
        <AgentReviewDetails
          agent={agent}
          validationErrors={agent.validation_errors}
        />
      )}
      {agent.admin_notes && (
        <p className="text-sm text-enterprise-600 mt-2 italic">
          Notes: {agent.admin_notes}
        </p>
      )}
      <span className="text-xs text-enterprise-400 mt-2 block">
        {formatDate(agent.reviewed_at ?? agent.created_at)}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    changes_requested: "bg-amber-100 text-amber-700",
  };
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? "bg-enterprise-100 text-enterprise-600"}`}>
      {label}
    </span>
  );
}

export function AdminAgentsTab({ token }: { token: string }) {
  const [view, setView] = useState<"pending" | "history">("pending");
  const pending = useQuery(api.admin.getPendingAgents, { token });
  const history = useQuery(
    api.admin.getAgentSubmissionsHistory,
    view === "history" ? { token } : "skip"
  );
  const approve = useMutation(api.admin.approveAgent);
  const reject = useMutation(api.admin.rejectAgent);
  const requestChanges = useMutation(api.admin.requestChangesAgent);

  const pendingCount = pending?.length ?? 0;

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
          {pending === undefined ? (
            <div className="flex items-center gap-2 text-enterprise-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : !pending.length ? (
            <p className="text-enterprise-500 py-8 text-center">No pending agent submissions.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((agent: any) => (
                <AgentCard
                  key={agent._id}
                  agent={agent}
                  token={token}
                  approve={approve}
                  reject={reject}
                  requestChanges={requestChanges}
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
              {history.map((agent: any) => (
                <HistoryAgentCard key={agent._id} agent={agent} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
