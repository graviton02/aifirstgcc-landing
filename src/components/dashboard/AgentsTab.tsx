"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { AgentDetailView } from "./AgentDetailView";
import { AgentForm } from "./AgentForm";

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
    return <AgentsTabSkeleton />;
  }

  const pendingEdits = myEdits.filter((edit: any) => edit.status === "pending");
  const pendingSubmissions = companySubmissions
    .filter((submission: any) => submission.submission_status !== "approved")
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
          className="mb-4 flex items-center gap-1.5 text-sm text-enterprise-600 hover:text-enterprise-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </button>
        <div className="rounded-xl bg-enterprise-50 p-4">
          <h3 className="mb-4 font-semibold text-enterprise-900">
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
          className="mb-4 flex items-center gap-1.5 text-sm text-enterprise-600 hover:text-enterprise-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </button>
        <div className="rounded-xl bg-enterprise-50 p-4">
          <h3 className="mb-4 font-semibold text-enterprise-900">
            Revise {view.submission.agent_name}
          </h3>
          {view.submission.admin_notes && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-enterprise-900">Your Agents</h3>
          <span className="rounded-full bg-enterprise-100 px-2 py-0.5 text-xs text-enterprise-500">
            {agents.length}
          </span>
        </div>
        <button
          onClick={() => setView({ mode: "submit" })}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent-purple px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Submit New Agent
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      {pendingSubmissions.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <h4 className="text-sm font-semibold uppercase tracking-wide text-enterprise-500">
              Pending Review
            </h4>
          </div>
          <div className="space-y-3">
            {pendingSubmissions.map((submission: any) => {
              const canRevise =
                submission.submission_status === "changes_requested";

              return (
                <div
                  key={submission._id}
                  className="rounded-2xl border border-enterprise-200 bg-white p-5 shadow-card transition-all duration-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-enterprise-900">
                          {submission.agent_name}
                        </p>
                        <SubmissionStatusBadge
                          status={submission.submission_status}
                        />
                      </div>
                      {submission.tagline && (
                        <p className="mt-1 line-clamp-2 text-sm text-enterprise-600">
                          {submission.tagline}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-enterprise-500">
                      Submitted{" "}
                      {new Date(submission.created_at).toLocaleDateString("en-US")}
                    </div>
                  </div>

                  {submission.admin_notes && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{submission.admin_notes}</span>
                    </div>
                  )}

                  {canRevise && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setView({ mode: "resubmit", submission });
                        }}
                        className="rounded-lg border border-primary/30 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
                      >
                        Revise Submission
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!agents.length ? (
        <div className="py-16 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent-purple/10">
            <Bot className="h-12 w-12 text-primary/40" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-enterprise-900">
            No agents listed yet
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-enterprise-500">
            {pendingSubmissions.length > 0
              ? "Pending submissions will appear here once approved."
              : "Submit your first AI agent to the directory."}
          </p>
          {pendingSubmissions.length === 0 && (
            <button
              onClick={() => setView({ mode: "submit" })}
              className="mt-6 rounded-lg bg-gradient-to-r from-primary to-accent-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Submit an Agent
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {agents.map((agent: any, index: number) => {
            const categoryColor =
              CATEGORY_COLORS[agent.category] ?? "bg-enterprise-400";
            const hasPending = pendingEdits.some(
              (edit: any) => edit.agent_id === agent._id,
            );

            return (
              <motion.button
                key={agent._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.4, 0, 0.2, 1],
                }}
                onClick={() => setView({ mode: "detail", agent })}
                className="relative rounded-2xl bg-white p-6 text-left shadow-card transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg active:scale-[0.99] active:translate-y-0"
              >
                {hasPending && (
                  <span className="absolute right-4 top-4" title="Pending edits">
                    <Clock className="h-4 w-4 text-amber-500" />
                  </span>
                )}
                <h4 className="font-semibold text-enterprise-900">
                  {agent.agent_name}
                </h4>
                {agent.tagline && (
                  <p className="mt-1 line-clamp-2 text-sm text-enterprise-600">
                    {agent.tagline}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${categoryColor}`} />
                  <span className="text-xs text-enterprise-500">
                    {agent.category}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AgentsTabSkeleton() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-5 w-32 animate-pulse rounded bg-enterprise-200" />
        <div className="h-9 w-40 animate-pulse rounded-lg bg-enterprise-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl bg-white p-6 shadow-card"
          >
            <div className="h-4 w-40 rounded bg-enterprise-200" />
            <div className="mt-3 h-3 w-full rounded bg-enterprise-100" />
            <div className="mt-2 h-3 w-2/3 rounded bg-enterprise-100" />
            <div className="mt-4 flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-enterprise-200" />
              <div className="h-3 w-16 rounded bg-enterprise-100" />
            </div>
          </div>
        ))}
      </div>
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
