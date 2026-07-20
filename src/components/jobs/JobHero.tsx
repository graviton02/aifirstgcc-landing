"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { JobSearchControls } from "@/components/jobs/JobSearchControls";
import { useJobBoardRole } from "@/jobs/useJobBoardRole";

type JobHeroProps = {
  search: string;
  onSearchChange: (value: string) => void;
  category?: string;
  onCategoryChange?: (cat: string) => void;
};

export function JobHero({
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: JobHeroProps) {
  const { isSignedIn } = useAuth();
  const { role: jobBoardRole } = useJobBoardRole();

  const ctaHref = (role: "jobseeker" | "recruiter") =>
    isSignedIn
      ? `/jobs/onboarding?role=${role}`
      : `/sign-up?redirect_url=${encodeURIComponent(`/jobs/onboarding?role=${role}`)}`;

  return (
    <AnimatedSection>
      <section className="noise-texture relative overflow-hidden rounded-[32px] border border-enterprise-200 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_30%),linear-gradient(135deg,_#f8fbff_0%,_#eef5ff_45%,_#f3f4f6_100%)] px-6 py-12 shadow-sm sm:px-10 sm:py-16">
        <div className="absolute right-6 top-6 hidden h-24 w-24 rounded-full bg-blue-200/40 blur-2xl sm:block" />
        <div className="absolute left-6 bottom-6 hidden h-32 w-32 rounded-full bg-purple-200/30 blur-3xl sm:block" />
        <StaggerContainer className="relative max-w-3xl">
          <StaggerItem>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              AI Talent for GCCs
            </div>
          </StaggerItem>
          <StaggerItem>
            <h1 className="mt-5 max-w-2xl font-display text-display-sm font-bold tracking-tight text-enterprise-950 sm:text-display-md">
              Where GCCs Discover AI Talent
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-4 max-w-2xl text-base leading-7 text-enterprise-700 sm:text-lg">
              Source AI talent for your Global Capability Center.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-4 flex flex-wrap gap-3">
              {jobBoardRole === "jobseeker" ? (
                <Button asChild className="rounded-2xl">
                  <Link href="/jobs/dashboard">
                    My Applications
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : jobBoardRole === "recruiter" ? (
                <Button asChild className="rounded-2xl">
                  <Link href="/jobs/post">
                    Post a Job
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild className="rounded-2xl">
                    <Link href={ctaHref("jobseeker")}>
                      Find Your Next AI Role
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="rounded-2xl">
                    <Link href={ctaHref("recruiter")}>
                      Hire AI Talent
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-8">
              <JobSearchControls
                search={search}
                onSearchChange={onSearchChange}
                category={category}
                onCategoryChange={onCategoryChange}
              />
            </div>
          </StaggerItem>
        </StaggerContainer>
      </section>
    </AnimatedSection>
  );
}
