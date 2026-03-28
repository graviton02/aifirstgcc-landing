"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useAction, useQuery } from "convex/react";
import { Loader2, Mail, MessageSquare, CheckCircle2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { getErrorMessage } from "@/lib/report-error";

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
    approved: "bg-blue-100 text-blue-700",
    contacted: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        classes[status] ?? "bg-enterprise-100 text-enterprise-600"
      }`}
    >
      {status === "approved" ? "Ready to contact" : "Contacted"}
    </span>
  );
}

export function LeadsTab() {
  const leads = useQuery(api.providerRequests.getMyCompanyLeads);
  const markLeadContacted = useAction(api.providerRequests.markLeadContacted);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (leads === undefined) {
    return (
      <div className="flex items-center gap-2 text-enterprise-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  const handleMarkContacted = async (requestId: string) => {
    setError("");
    setSuccess("");
    setActiveLeadId(requestId);

    try {
      await markLeadContacted({ request_id: requestId as any });
      setSuccess("Lead marked as contacted.");
    } catch (actionError) {
      setError(
        getErrorMessage(
          actionError,
          "We couldn't update the lead. Please try again."
        )
      );
    } finally {
      setActiveLeadId(null);
    }
  };

  if (!leads.length) {
    return (
      <div className="py-12 text-center text-enterprise-500">
        <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-50" />
        <p>No approved leads yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      {leads.map((lead: any) => (
        <div
          key={lead._id}
          className="rounded-2xl border border-enterprise-200 bg-white p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-enterprise-900">
                  {lead.agent?.agent_name ?? "Unknown agent"}
                </h3>
                <StatusBadge status={lead.status} />
              </div>
              <p className="mt-1 text-sm text-enterprise-500">
                {lead.company?.name ?? "Unknown provider"} • Requested{" "}
                {formatDate(lead.created_at)}
              </p>
            </div>

            {lead.status === "approved" && (
              <button
                onClick={() => handleMarkContacted(lead._id)}
                disabled={activeLeadId === lead._id}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {activeLeadId === lead._id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Mark Contacted"
                )}
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailBlock label="GCC Contact">
              <div className="space-y-1">
                <p className="text-sm font-medium text-enterprise-900">
                  {lead.gcc_name ?? "Unknown GCC"}
                </p>
                <a
                  href={`mailto:${lead.gcc_email ?? lead.gcc_user_email ?? ""}`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {lead.gcc_email ?? lead.gcc_user_email ?? "No email"}
                </a>
                <p className="text-sm text-enterprise-600">
                  {lead.gcc_organization ?? "Unknown organization"}
                </p>
                <p className="text-sm text-enterprise-500">
                  {lead.gcc_industry ?? "Unknown industry"}
                </p>
              </div>
            </DetailBlock>
            <DetailBlock label="Timeline">
              <p className="text-sm text-enterprise-700">
                {lead.timeline ?? "Not specified"}
              </p>
              {lead.contacted_at && (
                <p className="mt-2 text-xs text-enterprise-500">
                  Marked contacted on {formatDate(lead.contacted_at)}
                </p>
              )}
            </DetailBlock>
            <DetailBlock label="Use Case">
              <p className="text-sm text-enterprise-700">
                {lead.use_case ?? "Not provided"}
              </p>
            </DetailBlock>
            <DetailBlock label="Current Challenge">
              <p className="text-sm text-enterprise-700">
                {lead.current_challenge ?? lead.message ?? "Not provided"}
              </p>
            </DetailBlock>
            <DetailBlock label="Expected Outcome" className="md:col-span-2">
              <p className="text-sm text-enterprise-700">
                {lead.expected_outcome ?? "Not provided"}
              </p>
            </DetailBlock>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailBlock({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-400">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
