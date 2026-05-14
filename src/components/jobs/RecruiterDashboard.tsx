"use client";

import { useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, ChevronDown, ChevronUp, CircleOff, CheckCircle, Clock, XCircle, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ApplicantRow } from "./ApplicantRow";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedSection";
import { DashboardCardSkeleton } from "./JobSkeleton";

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  closed: "bg-enterprise-200 text-enterprise-600",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
  closed: <Ban className="h-3 w-3" />,
};

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function RecruiterDashboard({
  showCreatedState = false,
}: {
  showCreatedState?: boolean;
}) {
  const jobs = useQuery(api.jobs.getRecruiterDashboard, {});
  const closeJob = useMutation(api.jobs.closeMine);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [closingJobId, setClosingJobId] = useState<string | null>(null);

  if (jobs === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="gradient-border rounded-3xl border border-enterprise-200 bg-white p-8 text-center shadow-card">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <BriefcaseBusiness className="mx-auto h-10 w-10 text-enterprise-300" />
        </motion.div>
        <h2 className="mt-4 text-xl font-semibold text-enterprise-950">
          No jobs posted yet
        </h2>
        <p className="mt-2 text-sm text-enterprise-600">
          Post your first role to start collecting applications in one place.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="sm">
            <Link href="/jobs/post">Post a job</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/jobs">Browse job board</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <StaggerContainer className="space-y-4">
      {showCreatedState ? (
        <StaggerItem>
          <div className="rounded-3xl border border-green-200 bg-green-50 px-5 py-4 shadow-card">
            <p className="text-sm font-medium text-green-800">
              Job submitted for review. You can track approval status and admin
              feedback here.
            </p>
          </div>
        </StaggerItem>
      ) : null}
      {jobs.map((job) => {
        const isExpanded = expandedJobId === String(job._id);
        const isConfirmingClose = closingJobId === String(job._id);
        return (
          <StaggerItem key={job._id}>
            <div className="rounded-3xl border border-enterprise-200 bg-white p-6 shadow-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-enterprise-950">{job.title}</h2>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[job.status] ?? "bg-enterprise-100 text-enterprise-700"}`}>
                      {STATUS_ICONS[job.status]}
                      {statusLabel(job.status)}
                    </span>
                    {job.is_expired ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        Deadline passed
                      </span>
                    ) : null}
                    {job.apply_url ? (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        External apply
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-enterprise-600">
                    {job.company_name} · {job.location}
                  </p>
                  <p className="mt-3 text-sm text-enterprise-700">
                    Posted {formatDate(job.created_at)}
                    {job.reviewed_at ? ` · Reviewed ${formatDate(job.reviewed_at)}` : ""}
                  </p>
                  {job.admin_notes ? (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                        Admin feedback
                      </p>
                      <p className="mt-1 text-sm text-amber-800">
                        {job.admin_notes}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.status === "approved" && !job.apply_url ? (
                    isConfirmingClose ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-enterprise-600">Close this job?</span>
                        <button
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                          onClick={async () => {
                            await closeJob({ job_id: job._id });
                            setClosingJobId(null);
                          }}
                        >
                          Yes, close
                        </button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setClosingJobId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setClosingJobId(String(job._id))}
                      >
                        <CircleOff className="h-4 w-4" />
                        Close job
                      </Button>
                    )
                  ) : null}
                  {!job.apply_url ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setExpandedJobId(isExpanded ? null : String(job._id))
                      }
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      Applicants ({job.applicant_count})
                    </Button>
                  ) : null}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 space-y-3 border-t border-enterprise-100 pt-6">
                      {job.applicants.length > 0 ? (
                        job.applicants.map((application: any) => (
                          <ApplicantRow
                            key={application._id}
                            application={application}
                          />
                        ))
                      ) : (
                        <p className="text-sm text-enterprise-500">
                          No applications received yet.
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
