"use client";

import { useState } from "react";
import { BriefcaseBusiness, CheckCircle, ChevronDown, ChevronUp, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";
import { DashboardCardSkeleton } from "@/components/jobs/JobSkeleton";

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PendingJobCard({
  job,
  approve,
  reject,
}: {
  job: any;
  approve: any;
  reject: any;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [actionResult, setActionResult] = useState<"approved" | "rejected" | null>(null);

  const handleApprove = async () => {
    setLoading("approve");
    try {
      await approve({ job_id: job._id as Id<"jobs"> });
      setActionResult("approved");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading("reject");
    try {
      await reject({
        job_id: job._id as Id<"jobs">,
        notes,
      });
      setRejecting(false);
      setNotes("");
      setActionResult("rejected");
    } finally {
      setLoading(null);
    }
  };

  if (actionResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl border p-4 text-sm font-medium flex items-center gap-2 ${actionResult === "approved" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}
      >
        {actionResult === "approved" ? (
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 flex-shrink-0" />
        )}
        {job.title} — {actionResult === "approved" ? "Approved and now live." : "Rejected."}
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-enterprise-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-enterprise-900">{job.title}</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {job.category}
            </span>
          </div>
          <p className="mt-1 text-sm text-enterprise-600">
            {job.company_name} · {job.location}
          </p>
          <p className="mt-1 text-xs text-enterprise-500">
            Recruiter: {job.recruiter?.name ?? "Unknown"} · Submitted {formatDate(job.created_at)}
          </p>
          <p className="mt-3 line-clamp-2 text-sm text-enterprise-700">{job.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[job.job_type, job.seniority, job.workplace_type].map((v: string) => (
              <span key={v} className="rounded-full bg-enterprise-100 px-2 py-0.5 text-xs text-enterprise-600">
                {v}
              </span>
            ))}
          </div>
          <button
            onClick={() => setExpanded((current) => !current)}
            className="mt-2 flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>

        {!rejecting ? (
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              {loading === "approve" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Approve
            </button>
            <button
              onClick={() => setRejecting(true)}
              disabled={loading !== null}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          </div>
        ) : null}
      </div>

      {expanded ? (
        <div className="mt-4 space-y-3 border-t border-enterprise-100 pt-4 text-sm text-enterprise-700">
          {job.requirements ? (
            <p className="whitespace-pre-wrap">{job.requirements}</p>
          ) : null}
          {job.skills?.length ? (
            <p>Skills: {job.skills.join(", ")}</p>
          ) : null}
          <p>
            {job.job_type} · {job.seniority} · {job.workplace_type}
          </p>
          {job.apply_url ? <p>External apply: {job.apply_url}</p> : null}
          {job.salary_min != null && job.salary_max != null ? (
            <p>
              Salary: {job.salary_currency ?? ""} {job.salary_min} - {job.salary_max} {job.salary_type}
            </p>
          ) : null}
        </div>
      ) : null}

      {rejecting ? (
        <div className="mt-4 border-t border-enterprise-100 pt-4">
          <label className="mb-2 block text-sm font-medium text-enterprise-700">
            Rejection notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-lg border border-enterprise-200 bg-enterprise-50 px-3 py-2 text-sm text-enterprise-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => {
                setRejecting(false);
                setNotes("");
              }}
              className="rounded-lg px-3 py-1.5 text-sm text-enterprise-600 transition-colors hover:bg-enterprise-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!notes.trim() || loading !== null}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {loading === "reject" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              Reject job
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HistoryJobCard({ job }: { job: any }) {
  return (
    <div className="rounded-2xl border border-enterprise-200 bg-white p-4 shadow-sm hover:shadow-card transition-shadow duration-300">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-enterprise-900">{job.title}</p>
        <span className="rounded-full bg-enterprise-100 px-2 py-0.5 text-xs text-enterprise-700">
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
      </div>
      <p className="mt-1 text-sm text-enterprise-600">
        {job.company_name} · {job.location}
      </p>
      <p className="mt-1 text-xs text-enterprise-500">
        Reviewed {formatDate(job.reviewed_at ?? job.created_at)}
      </p>
      {job.admin_notes ? (
        <p className="mt-3 text-sm italic text-enterprise-600">{job.admin_notes}</p>
      ) : null}
    </div>
  );
}

export function AdminJobsTab() {
  const [view, setView] = useState<"pending" | "history">("pending");
  const pending = useQuery(api.admin.getPendingJobs, {});
  const history = useQuery(api.admin.getJobsHistory, view === "history" ? {} : "skip");
  const approve = useMutation(api.admin.approveJob);
  const reject = useMutation(api.admin.rejectJob);

  const items = view === "pending" ? pending : history;

  if (items === undefined) {
    return (
      <div className="space-y-4">
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
      </div>
    );
  }

  const tabs = [
    { key: "pending" as const, label: `Pending (${pending?.length ?? 0})` },
    { key: "history" as const, label: "History" },
  ];

  return (
    <div>
      <div className="flex gap-6 border-b border-enterprise-200 mb-6">
        {tabs.map((tab) => {
          const isActive = view === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`relative pb-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "text-enterprise-900"
                  : "text-enterprise-500 hover:text-enterprise-700"
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="admin-jobs-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                />
              )}
            </button>
          );
        })}
      </div>

      <StaggerContainer className="space-y-4">
        {items.length === 0 ? (
          <StaggerItem>
            <div className="rounded-2xl border border-dashed border-enterprise-300 bg-white p-8 text-center text-sm text-enterprise-500">
              <BriefcaseBusiness className="mx-auto h-8 w-8 text-enterprise-300 mb-3" />
              {view === "pending" ? "No pending jobs." : "No reviewed jobs yet."}
            </div>
          </StaggerItem>
        ) : view === "pending" ? (
          items.map((job) => (
            <StaggerItem key={job._id}>
              <PendingJobCard
                job={job}
                approve={approve}
                reject={reject}
              />
            </StaggerItem>
          ))
        ) : (
          items.map((job) => (
            <StaggerItem key={job._id}>
              <HistoryJobCard job={job} />
            </StaggerItem>
          ))
        )}
      </StaggerContainer>
    </div>
  );
}
