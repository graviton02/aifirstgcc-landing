"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, Users } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { DashboardCardSkeleton } from "@/components/jobs/JobSkeleton";
import {
  CANDIDATE_LEAD_STATUSES,
  JOB_CATEGORY_LABELS,
  JOB_EXPERIENCE_LABELS,
  type CandidateLeadStatus,
  type JobCategory,
  type JobExperienceLevel,
} from "@/jobs/config";

type CandidateLead = {
  _id: Id<"candidateLeads">;
  full_name: string;
  email: string;
  current_title: string;
  years_experience: string;
  job_category: string;
  profile_url?: string;
  source?: string;
  status: string;
  created_at: number;
};

const CSV_COLUMNS = [
  "Name",
  "Email",
  "Title",
  "Experience",
  "Category",
  "Profile URL",
  "Source",
  "Status",
  "Signed up",
] as const;

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function buildCandidateCsv(leads: CandidateLead[]) {
  const rows = leads.map((lead) =>
    [
      lead.full_name,
      lead.email,
      lead.current_title,
      JOB_EXPERIENCE_LABELS[lead.years_experience as JobExperienceLevel] ??
        lead.years_experience,
      JOB_CATEGORY_LABELS[lead.job_category as JobCategory] ?? lead.job_category,
      lead.profile_url ?? "",
      lead.source ?? "",
      lead.status,
      new Date(lead.created_at).toISOString(),
    ]
      .map(csvCell)
      .join(",")
  );

  return [CSV_COLUMNS.join(","), ...rows].join("\n");
}

export function AdminCandidatesTab() {
  const leads = useQuery(api.admin.getCandidateLeads, {}) as
    | CandidateLead[]
    | undefined;
  const updateStatus = useMutation(api.admin.updateCandidateLeadStatus);

  const [statusFilter, setStatusFilter] = useState<CandidateLeadStatus | "all">(
    "all"
  );
  const [copied, setCopied] = useState(false);

  const visibleLeads = useMemo(() => {
    if (!leads) return [];
    if (statusFilter === "all") return leads;
    return leads.filter((lead) => lead.status === statusFilter);
  }, [leads, statusFilter]);

  const handleCopyEmails = async () => {
    const emails = visibleLeads.map((lead) => lead.email).join(", ");
    try {
      await navigator.clipboard.writeText(emails);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked (insecure context) — nothing useful to recover.
    }
  };

  const handleExportCsv = () => {
    const blob = new Blob([buildCandidateCsv(visibleLeads)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orbys360-candidates-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (leads === undefined) {
    return <DashboardCardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="font-display text-xl font-semibold text-enterprise-950">
            Candidate leads
          </h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {visibleLeads.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as CandidateLeadStatus | "all")
            }
            className="rounded-xl border border-enterprise-200 bg-white px-3 py-2 text-sm text-enterprise-700 outline-none focus:border-blue-500"
          >
            <option value="all">All statuses</option>
            {CANDIDATE_LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCopyEmails}
            disabled={visibleLeads.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-enterprise-200 bg-white px-3 py-2 text-sm font-medium text-enterprise-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy emails"}
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={visibleLeads.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-enterprise-200 bg-white px-3 py-2 text-sm font-medium text-enterprise-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {visibleLeads.length === 0 ? (
        <div className="rounded-2xl border border-enterprise-200 bg-white p-10 text-center">
          <p className="text-sm text-enterprise-600">No candidate leads yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-enterprise-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-enterprise-200 bg-enterprise-50 text-xs uppercase tracking-wide text-enterprise-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Experience</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Profile</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Signed up</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleLeads.map((lead) => (
                <tr
                  key={lead._id}
                  className="border-b border-enterprise-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-enterprise-900">
                    {lead.full_name}
                  </td>
                  <td className="px-4 py-3 text-enterprise-700">{lead.email}</td>
                  <td className="px-4 py-3 text-enterprise-700">
                    {lead.current_title}
                  </td>
                  <td className="px-4 py-3 text-enterprise-700">
                    {JOB_EXPERIENCE_LABELS[
                      lead.years_experience as JobExperienceLevel
                    ] ?? lead.years_experience}
                  </td>
                  <td className="px-4 py-3 text-enterprise-700">
                    {JOB_CATEGORY_LABELS[lead.job_category as JobCategory] ??
                      lead.job_category}
                  </td>
                  <td className="px-4 py-3">
                    {lead.profile_url ? (
                      <a
                        href={lead.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                      >
                        Open
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-enterprise-400">&mdash;</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-enterprise-500">
                    {lead.source ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-enterprise-500">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Status for ${lead.full_name}`}
                      value={lead.status}
                      onChange={(event) =>
                        updateStatus({
                          lead_id: lead._id,
                          status: event.target.value,
                        })
                      }
                      className="rounded-lg border border-enterprise-200 bg-white px-2 py-1 text-xs text-enterprise-700 outline-none focus:border-blue-500"
                    >
                      {CANDIDATE_LEAD_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
