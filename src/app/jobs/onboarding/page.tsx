"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Navbar } from "@/components/shared/Navbar";
import { JobOnboarding } from "@/components/jobs/JobOnboarding";
import { buildJobBoardSignInUrl, isJobBoardRole, sanitizeJobBoardReturnUrl } from "@/jobs/config";
import { useJobBoardRole } from "@/jobs/useJobBoardRole";

export default function JobBoardOnboardingPage() {
  return (
    <Suspense fallback={<JobBoardOnboardingFallback />}>
      <JobBoardOnboardingContent />
    </Suspense>
  );
}

function JobBoardOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { role, isLoaded } = useJobBoardRole();
  const returnUrl = sanitizeJobBoardReturnUrl(
    searchParams.get("returnUrl"),
    "/jobs/dashboard"
  );
  const roleParam = searchParams.get("role");
  const presetRole = isJobBoardRole(roleParam) ? roleParam : undefined;
  const onboardingPath = presetRole
    ? `/jobs/onboarding?role=${presetRole}&returnUrl=${encodeURIComponent(returnUrl)}`
    : `/jobs/onboarding?returnUrl=${encodeURIComponent(returnUrl)}`;

  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) {
      router.replace(buildJobBoardSignInUrl(onboardingPath));
      return;
    }
    if (!isLoaded) return;
    if (role) {
      router.replace(returnUrl);
    }
  }, [authLoaded, isLoaded, isSignedIn, onboardingPath, role, router, returnUrl]);

  if (!authLoaded || !isLoaded || !isSignedIn || role) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen flex-col items-center justify-center bg-enterprise-50">
          <Loader2 className="h-6 w-6 animate-spin text-enterprise-400" />
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
          <JobOnboarding returnUrl={returnUrl} presetRole={presetRole} />
        </Container>
      </div>
    </>
  );
}

function JobBoardOnboardingFallback() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-enterprise-50">
        <Loader2 className="h-6 w-6 animate-spin text-enterprise-400" />
      </div>
    </>
  );
}
