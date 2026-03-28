"use client";

import { useState } from "react";
import { Loader2, Plus, Bot, CheckCircle, Clock, ArrowLeft, AlertCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { AgentForm } from "./AgentForm";
import { AgentDetailView } from "./AgentDetailView";

type ViewState =
  | { mode: "list" }
  | { mode: "detail"; agent: any }
  | { mode: "submit" }
  | { mode: "resubmit"; submission: any };

export function AgentsTab({ companyId }: { companyId: string }) {
  const agents = useQuery(api.agents.getByCompany, { company_id: companyId as any });
  const companySubmissions = useQuery(api.agents.getCompanySubmissions, {
    company_id: companyId as any,
  });
  const myEdits = useQuery(api.agents.getMyEdits);
  const [view, setView] = useState<ViewState>({ mode: "list" });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (agents === undefined || companySubmissions === undefined || myEdits === undefined) {
    return (
      <div className="flex items-center gap-2 text-enterprise-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
      </div>
    );
  }

  const pendingEdits = myEdits.filter((e: any) => e.status === "pending");
  const pendingSubmissions = companySubmissions
    .filter(
      (submission: any) =>
        submission.submission_status !== "approved"
    )
    .sort((left: any, right: any) => right.created_at - left.created_at);

  if (view.mode === "detail") {
    return (
        <AgentDetailView
          agent={view.agent}
          companyId={companyId}
          onBack={() => setView({ mode: "list" })}
          pendingEdits={myEdits}
        />
      );
  }

  if (view.mode === "submit") {
    return (
      <div>
        <button
          onClick={() => setView({ mode: "list" })}
          className="flex items-center gap-1.5 text-sm text-enterprise-600 hover:text-enterprise-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </button>
        <div className="p-4 bg-enterprise-50 rounded-xl">
          <h3 className="font-semibold text-enterprise-900 mb-4">
            Submit New Agent
          </h3>
          <AgentForm
            mode="submit"
            companyId={companyId}
            onSuccess={() => {
              setView({ mode: "list" });
              showSuccess("Agent submitted for admin review.");
            }}
            onCancel={() => setView({ mode: "list" })}
          />
        </div>
      </div>
    );
  }

  if (view.mode === "resubmit") {
    return (
      <div>
        <button
          onClick={() => setView({ mode: "list" })}
          className="flex items-center gap-1.5 text-sm text-enterprise-600 hover:text-enterprise-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </button>
        <div className="p-4 bg-enterprise-50 rounded-xl">
          <h3 className="font-semibold text-enterprise-900 mb-4">
            Revise {view.submission.agent_name}
          </h3>
          {view.submission.admin_notes && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{view.submission.admin_notes}</span>
            </div>
          )}
          <AgentForm
            mode="resubmit"
            initialData={view.submission}
            companyId={companyId}
            submissionId={view.submission._id}
            onSuccess={() => {
              setView({ mode: "list" });
              showSuccess("Changes resubmitted for admin review.");
            }}
            onCancel={() => setView({ mode: "list" })}
          />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-enterprise-900">Your Agents</h3>
        <button
          onClick={() => setView({ mode: "submit" })}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4" />
          Submit New Agent
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      {pendingSubmissions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-enterprise-500 mb-3">
            Pending Agent Submissions
          </h4>
          <div className="space-y-3">
            {pendingSubmissions.map((submission: any) => (
              <div
                key={submission._id}
                className="rounded-xl border border-enterprise-200 bg-enterprise-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-enterprise-900">
                        {submission.agent_name}
                      </p>
                      <SubmissionStatusBadge status={submission.submission_status} />
                    </div>
                    {submission.tagline && (
                      <p className="mt-1 text-sm text-enterprise-600">
                        {submission.tagline}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-enterprise-700">
                      {submission.description}
                    </p>
                  </div>
                  <div className="text-xs text-enterprise-500">
                    Submitted {new Date(submission.created_at).toLocaleDateString("en-US")}
                  </div>
                </div>

                {submission.admin_notes && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{submission.admin_notes}</span>
                  </div>
                )}

                {submission.submission_status === "changes_requested" && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => setView({ mode: "resubmit", submission })}
                      className="rounded-lg border border-primary/30 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
                    >
                      Revise Submission
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!agents.length ? (
        <div className="text-center py-12 text-enterprise-500">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>
            {pendingSubmissions.length > 0
              ? "No active agents yet. Pending submissions will appear here once approved."
              : "No agents listed yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent: any) => {
            const categoryColor =
              CATEGORY_COLORS[agent.category] ?? "bg-enterprise-400";
            const hasPending = pendingEdits.some(
              (e: any) => e.agent_id === agent._id
            );

            return (
              <button
                key={agent._id}
                onClick={() => setView({ mode: "detail", agent })}
                className="p-4 bg-white border border-enterprise-200 rounded-xl text-left hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-enterprise-900">
                    {agent.agent_name}
                  </h4>
                  {hasPending && (
                    <span title="Pending edits">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    </span>
                  )}
                </div>
                {agent.tagline && (
                  <p className="text-sm text-enterprise-600 mt-1">
                    {agent.tagline}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`w-2 h-2 rounded-full ${categoryColor}`}
                  />
                  <span className="text-xs text-enterprise-500">
                    {agent.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubmissionStatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    changes_requested: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        classes[status] ?? "bg-enterprise-100 text-enterprise-600"
      }`}
    >
      {status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
    </span>
  );
}
