"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BriefcaseBusiness, Loader2, Send } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RecruiterDashboard } from "@/components/jobs/RecruiterDashboard";
import { SeekerDashboard } from "@/components/jobs/SeekerDashboard";
import { buildJobBoardSignInUrl } from "@/jobs/config";
import { useJobBoardRole } from "@/jobs/useJobBoardRole";

const RECRUITER_NAV = [{ key: "jobs", label: "My Jobs", icon: BriefcaseBusiness }];
const SEEKER_NAV = [{ key: "applications", label: "Applications", icon: Send }];

export default function JobBoardDashboardPage() {
  return (
    <Suspense fallback={<JobBoardDashboardFallback />}>
      <JobBoardDashboardContent />
    </Suspense>
  );
}

function JobBoardDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { role, isLoaded } = useJobBoardRole();
  const showCreatedState = searchParams.get("created") === "1";

  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) {
      router.replace(buildJobBoardSignInUrl("/jobs/dashboard"));
      return;
    }
    if (!isLoaded) return;
    if (!role) {
      router.replace("/jobs/onboarding?returnUrl=%2Fjobs%2Fdashboard");
    }
  }, [authLoaded, isLoaded, isSignedIn, role, router]);

  if (!authLoaded || !isLoaded || !isSignedIn || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-enterprise-50">
        <Loader2 className="h-6 w-6 animate-spin text-enterprise-400" />
      </div>
    );
  }

  const recruiterView = role === "recruiter";

  return (
    <DashboardShell
      title={recruiterView ? "Recruiter Dashboard" : "Application Dashboard"}
      navItems={recruiterView ? RECRUITER_NAV : SEEKER_NAV}
      activeKey={recruiterView ? "jobs" : "applications"}
      onNavigate={() => undefined}
    >
      {recruiterView ? (
        <RecruiterDashboard showCreatedState={showCreatedState} />
      ) : (
        <SeekerDashboard />
      )}
    </DashboardShell>
  );
}

function JobBoardDashboardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-enterprise-50">
      <Loader2 className="h-6 w-6 animate-spin text-enterprise-400" />
    </div>
  );
}
