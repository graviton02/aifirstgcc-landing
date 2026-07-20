"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Container } from "@/components/shared/Container";
import { Navbar } from "@/components/shared/Navbar";
import { Pagination } from "@/components/shared/Pagination";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimatedSection";
import { CandidateSignupHero } from "@/components/jobs/CandidateSignupHero";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobHero } from "@/components/jobs/JobHero";
import { JobListSkeleton } from "@/components/jobs/JobSkeleton";
import { useJobBoardRole } from "@/jobs/useJobBoardRole";

export default function JobsPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<JobsLoadingState />}>
        <JobsPageContent />
      </Suspense>
    </>
  );
}

function JobsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const workplaceType = searchParams.get("workplaceType") ?? "";
  const jobType = searchParams.get("jobType") ?? "";
  const seniority = searchParams.get("seniority") ?? "";

  const result = useQuery(api.jobs.listPublic, {
    search: search || undefined,
    category: category || undefined,
    workplace_type: workplaceType || undefined,
    job_type: jobType || undefined,
    seniority: seniority || undefined,
    page,
  });

  const totalPages = useMemo(() => {
    if (!result) return 1;
    return Math.max(1, Math.ceil(result.count / result.pageSize));
  }, [result]);

  const { role: jobBoardRole, isLoaded: roleLoaded, isSignedIn } = useJobBoardRole();

  // Visitors without a job board role get the lead capture hero. Signed-in
  // users keep the existing hero, and we wait for their role to load rather
  // than flashing the capture card at them.
  const showCandidateCapture = !jobBoardRole && !(isSignedIn && !roleLoaded);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (!("page" in updates)) {
      params.set("page", "1");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const searchControls = {
    search,
    onSearchChange: (value: string) => updateParams({ search: value }),
    category,
    onCategoryChange: (cat: string) => updateParams({ category: cat }),
  };

  return (
    <div className="bg-enterprise-50 pb-16 pt-24 sm:pt-28">
      <Container size="wide" className="space-y-8">
        {showCandidateCapture ? (
          <CandidateSignupHero searchControls={searchControls} />
        ) : (
          <JobHero {...searchControls} />
        )}
        <JobFilters
          category={category}
          workplaceType={workplaceType}
          jobType={jobType}
          seniority={seniority}
          onFilterChange={(next) =>
            updateParams({
              category: next.category ?? category,
              workplaceType: next.workplaceType ?? workplaceType,
              jobType: next.jobType ?? jobType,
              seniority: next.seniority ?? seniority,
            })
          }
        />

        {result === undefined ? (
          <JobListSkeleton />
        ) : result.data.length === 0 ? (
          <AnimatedSection>
            <div className="rounded-3xl border border-enterprise-200 bg-white p-10 text-center shadow-card">
              <h2 className="font-display text-2xl font-semibold text-enterprise-950">No jobs found</h2>
              <p className="mt-3 text-sm text-enterprise-600">
                Try broadening your search or clearing one of the filters.
              </p>
            </div>
          </AnimatedSection>
        ) : (
          <>
            <AnimatedSection delay={0.1}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-enterprise-600">
                  {result.count} open role{result.count === 1 ? "" : "s"}
                </p>
                {(category || workplaceType || jobType || seniority) ? (
                  <button
                    onClick={() => updateParams({ category: "", workplaceType: "", jobType: "", seniority: "", page: "1" })}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            </AnimatedSection>
            <StaggerContainer className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {result.data.map((job) => (
                <StaggerItem key={job._id}>
                  <JobCard job={job} />
                </StaggerItem>
              ))}
            </StaggerContainer>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
              totalItems={result.count}
              pageSize={result.pageSize}
            />
          </>
        )}
      </Container>
    </div>
  );
}

function JobsLoadingState() {
  return (
    <div className="bg-enterprise-50 pb-16 pt-24 sm:pt-28">
      <Container size="wide" className="space-y-8">
        <div className="h-72 animate-pulse rounded-[32px] border border-enterprise-200 bg-enterprise-100" />
        <JobListSkeleton />
      </Container>
    </div>
  );
}
