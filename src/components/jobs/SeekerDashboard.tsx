"use client";

import Link from "next/link";
import { Clock, Search } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem, AnimatedSection } from "@/components/shared/AnimatedSection";
import { DashboardCardSkeleton } from "./JobSkeleton";
import { relativeTime } from "@/lib/relative-time";

function recencyBorderClass(appliedAt: number): string {
  const days = Math.floor((Date.now() - appliedAt) / 86400000);
  if (days < 7) return "border-l-4 border-l-blue-500";
  if (days < 30) return "border-l-4 border-l-enterprise-300";
  return "border-l-4 border-l-enterprise-200";
}

export function SeekerDashboard() {
  const applications = useQuery(api.jobApplications.getMine, {});

  if (applications === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <AnimatedSection>
        <div className="rounded-3xl border border-enterprise-200 bg-white p-8 text-center shadow-card">
          <Search className="mx-auto h-12 w-12 text-enterprise-300 mb-4" />
          <h2 className="text-xl font-semibold text-enterprise-950">
            No applications yet
          </h2>
          <p className="mt-2 text-sm text-enterprise-600">
            Browse the job board and apply to approved AI roles.
          </p>
          <div className="mt-6">
            <Button asChild size="sm">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <StaggerContainer className="space-y-4">
      {applications.map((application) => (
        <StaggerItem key={application._id}>
          <div
            className={`rounded-3xl border border-enterprise-200 bg-white p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-400 ease-smooth ${recencyBorderClass(application.applied_at)}`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-enterprise-950">
                  {application.job?.title ?? "Role unavailable"}
                </h2>
                <p className="mt-1 text-sm text-enterprise-600">
                  {application.job?.company_name ?? "Company unavailable"}
                </p>
                <p className="mt-3 text-sm text-enterprise-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-enterprise-400" />
                    Applied {relativeTime(application.applied_at)}
                  </span>
                </p>
              </div>
              {application.job?.slug ? (
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/jobs/${application.job.slug}`}>View job</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
