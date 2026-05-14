"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { BriefcaseBusiness, Loader2 } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Navbar } from "@/components/shared/Navbar";
import { JobPostForm } from "@/components/jobs/JobPostForm";
import { Button } from "@/components/ui/button";
import { buildJobBoardSignInUrl } from "@/jobs/config";
import { useJobBoardRole } from "@/jobs/useJobBoardRole";

export default function JobPostPage() {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { profile, role, isLoaded } = useJobBoardRole();

  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) {
      router.replace(buildJobBoardSignInUrl("/jobs/post"));
      return;
    }
    if (!isLoaded) return;
    if (!role) {
      router.replace("/jobs/onboarding?role=recruiter&returnUrl=%2Fjobs%2Fpost");
    }
  }, [authLoaded, isLoaded, isSignedIn, role, router]);

  if (!authLoaded || !isLoaded || !isSignedIn || !role) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen flex-col items-center justify-center bg-enterprise-50">
          <Loader2 className="h-6 w-6 animate-spin text-enterprise-400" />
        </div>
      </>
    );
  }

  if (role !== "recruiter") {
    return (
      <>
        <Navbar />
        <div className="relative bg-enterprise-50 pb-16 pt-24 sm:pt-28">
          <Container size="wide">
            <div className="mx-auto max-w-lg rounded-3xl border border-enterprise-200 bg-white p-8 text-center shadow-card">
              <BriefcaseBusiness className="mx-auto h-10 w-10 text-enterprise-300" />
              <h1 className="mt-4 text-xl font-semibold text-enterprise-950">
                Only recruiter accounts can post jobs
              </h1>
              <p className="mt-2 text-sm text-enterprise-600">
                You are signed in as a job seeker. Browse the job board to find and apply to open roles.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild size="sm">
                  <Link href="/jobs">Browse jobs</Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/jobs/dashboard">Your applications</Link>
                </Button>
              </div>
            </div>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="relative bg-enterprise-50 pb-16 pt-24 sm:pt-28">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 bg-gradient-radial from-purple-100/40 to-transparent blur-3xl" />
        <Container size="wide">
          <JobPostForm companyName={profile?.company_name} />
        </Container>
      </div>
    </>
  );
}
