"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { useJobBoardRole } from "@/jobs/useJobBoardRole";
import { sanitizeJobBoardReturnUrl } from "@/jobs/config";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { JobDetailSkeleton } from "@/components/jobs/JobSkeleton";
import {
  Briefcase,
  MapPin,
  Banknote,
  Calendar,
  GraduationCap,
} from "lucide-react";

function formatDate(timestamp?: number) {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatSalary(job: any) {
  if (typeof job.salary_min !== "number" || typeof job.salary_max !== "number") {
    return null;
  }
  const currency = job.salary_currency ?? "USD";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  const period = job.salary_type === "monthly" ? "/mo" : "/yr";
  return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}${period}`;
}

export function JobDetail({ slug }: { slug: string }) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { role, isLoaded: jobRoleLoaded } = useJobBoardRole();
  const job = useQuery(api.jobs.getPublicBySlug, { slug });
  const returnUrl = sanitizeJobBoardReturnUrl(`/jobs/${slug}`, "/jobs");

  const alreadyApplied = useQuery(
    api.jobApplications.hasApplied,
    job && isSignedIn && role === "jobseeker" ? { job_id: job._id } : "skip"
  );

  if (job === undefined) {
    return <JobDetailSkeleton />;
  }

  if (!job) {
    return (
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Jobs", href: "/jobs" },
            { label: "Not found" },
          ]}
        />
        <div className="rounded-3xl border border-enterprise-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-enterprise-950">
            Job not found
          </h1>
          <p className="mt-2 text-sm text-enterprise-600">
            This role may have been removed or is no longer publicly listed.
          </p>
          <div className="mt-6">
            <Button asChild size="sm">
              <Link href="/jobs">Browse open roles</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const showRoleAwareActions = authLoaded && jobRoleLoaded;
  const salaryText = formatSalary(job);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Jobs", href: "/jobs" },
          { label: job.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <AnimatedSection>
          <section className="rounded-3xl border border-enterprise-200 bg-white p-8 shadow-card">
            {/* Gradient title area */}
            <div className="-m-8 mb-8 rounded-t-3xl bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                {job.category.replace(/-/g, " ")}
              </p>
              <h1 className="mt-4 font-display text-display-sm text-enterprise-950">
                {job.title}
              </h1>
              <p className="mt-2 text-lg text-enterprise-700">
                {job.company_name} · {job.location}
              </p>
              <div className="mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />

              {/* Metadata grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-sm text-enterprise-600">
                  <MapPin className="h-4 w-4 text-enterprise-400" />
                  {capitalize(job.workplace_type)}
                </div>
                <div className="flex items-center gap-2 text-sm text-enterprise-600">
                  <Briefcase className="h-4 w-4 text-enterprise-400" />
                  {capitalize(job.job_type)}
                </div>
                <div className="flex items-center gap-2 text-sm text-enterprise-600">
                  <GraduationCap className="h-4 w-4 text-enterprise-400" />
                  {capitalize(job.seniority)}
                </div>
                {formatDate(job.deadline) ? (
                  <div className="flex items-center gap-2 text-sm text-enterprise-600">
                    <Calendar className="h-4 w-4 text-enterprise-400" />
                    Apply by {formatDate(job.deadline)}
                  </div>
                ) : null}
                {salaryText ? (
                  <div className="col-span-2 sm:col-span-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    {salaryText}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-8 space-y-8">
              <div>
                <h2 className="font-display text-xl font-semibold text-enterprise-950 border-l-4 border-blue-500 pl-4">
                  Role overview
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-enterprise-700">
                  {job.description}
                </p>
              </div>

              {job.requirements ? (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-enterprise-200 to-transparent" />
                  <div>
                    <h2 className="font-display text-xl font-semibold text-enterprise-950 border-l-4 border-blue-500 pl-4">
                      Requirements
                    </h2>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-enterprise-700">
                      {job.requirements}
                    </p>
                  </div>
                </>
              ) : null}

              {Array.isArray(job.skills) && job.skills.length > 0 ? (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-enterprise-200 to-transparent" />
                  <div>
                    <h2 className="font-display text-xl font-semibold text-enterprise-950 border-l-4 border-blue-500 pl-4">
                      Skills
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="rounded-full border border-enterprise-200 bg-enterprise-50 px-3 py-1 text-sm text-enterprise-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <aside className="space-y-4 sticky top-28">
            <div className="rounded-3xl border border-enterprise-200 bg-white p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-enterprise-950">Apply</h2>
              <p className="mt-2 text-sm text-enterprise-600">
                Posted {formatDate(job.created_at)}
                {job.is_expired ? " · Deadline passed" : ""}
              </p>

              <div className="mt-5">
                {job.apply_url ? (
                  <Button asChild className="w-full">
                    <a href={job.apply_url} target="_blank" rel="noreferrer">
                      Apply on company site
                    </a>
                  </Button>
                ) : !job.can_apply ? (
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    This job is no longer accepting applications.
                  </p>
                ) : !showRoleAwareActions ? (
                  <p className="text-sm text-enterprise-500">Checking your access...</p>
                ) : !isSignedIn ? (
                  <Button asChild className="w-full">
                    <Link
                      href={`/sign-in?redirect_url=${encodeURIComponent(
                        `/jobs/onboarding?role=jobseeker&returnUrl=${encodeURIComponent(returnUrl)}`
                      )}`}
                    >
                      Sign in to apply
                    </Link>
                  </Button>
                ) : !role ? (
                  <Button asChild className="w-full">
                    <Link
                      href={`/jobs/onboarding?role=jobseeker&returnUrl=${encodeURIComponent(returnUrl)}`}
                    >
                      Set up your Job Board profile to apply
                    </Link>
                  </Button>
                ) : role === "recruiter" ? (
                  <div className="space-y-3">
                    <p className="rounded-2xl border border-enterprise-200 bg-enterprise-50 px-4 py-3 text-sm text-enterprise-700">
                      Recruiter accounts cannot submit applications.
                    </p>
                    <Button asChild variant="secondary" size="sm" className="w-full">
                      <Link href="/jobs/dashboard">Go to your dashboard</Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm" className="w-full">
                      <Link href="/jobs/post">Post a new role</Link>
                    </Button>
                  </div>
                ) : alreadyApplied ? (
                  <div className="space-y-3">
                    <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                      You have already applied to this role.
                    </p>
                    <Button asChild variant="secondary" size="sm" className="w-full">
                      <Link href="/jobs/dashboard">View your applications</Link>
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={`/jobs/${slug}/apply`}>
                      Apply now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </AnimatedSection>
      </div>
    </div>
  );
}
