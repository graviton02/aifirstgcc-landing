"use client";

import { useState, useEffect } from "react";
import { Mail, ChevronDown, FileText, Phone, Check } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
] as const;

const STATUS_DOT_COLORS: Record<string, string> = {
  new: "bg-blue-500",
  reviewed: "bg-amber-500",
  shortlisted: "bg-green-500",
  rejected: "bg-red-500",
};

export function ApplicantRow({ application }: { application: any }) {
  const updateStatus = useMutation(api.jobApplications.updateRecruiterStatus);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!showSaved) return;
    const timer = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [showSaved]);

  const dotColor = STATUS_DOT_COLORS[application.recruiter_status] ?? "bg-enterprise-400";

  return (
    <div className="rounded-2xl border border-enterprise-100 bg-white p-4 shadow-sm hover:shadow-card transition-all duration-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
              {getInitials(application.name)}
            </div>
            <div>
              <p className="text-base font-semibold text-enterprise-950">
                {application.name}
              </p>
              <p className="text-sm text-enterprise-600">
                {application.current_title || "Candidate"} · {application.years_of_experience} years experience
              </p>
            </div>
          </div>
          <div className="space-y-1 text-sm text-enterprise-600">
            <p className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-enterprise-400" />
              {application.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-enterprise-400" />
              {application.phone}
            </p>
            <p>Applied {formatDate(application.applied_at)}</p>
          </div>
          {application.cover_note ? (
            <p className="max-w-2xl text-sm leading-6 text-enterprise-700">
              {application.cover_note}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 lg:min-w-56">
          <div className="relative">
            <span className={`pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${dotColor}`} />
            <select
              value={application.recruiter_status}
              onChange={async (event) => {
                await updateStatus({
                  application_id: application._id,
                  recruiter_status: event.target.value as
                    | "new"
                    | "reviewed"
                    | "shortlisted"
                    | "rejected",
                });
                setShowSaved(true);
              }}
              className="w-full appearance-none rounded-xl border border-enterprise-200 bg-white pl-8 pr-10 py-2 text-sm text-enterprise-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-enterprise-400" />
          </div>
          {showSaved ? (
            <p className="flex items-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" />
              Status updated
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" asChild>
              <a href={`mailto:${application.email}`}>
                <Mail className="h-4 w-4" />
                Email
              </a>
            </Button>
            {application.resume_url ? (
              <Button variant="secondary" size="sm" asChild>
                <a href={application.resume_url} target="_blank" rel="noreferrer">
                  <FileText className="h-4 w-4" />
                  Resume
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
