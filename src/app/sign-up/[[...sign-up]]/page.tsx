"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { resolveJobBoardAuthRedirectUrl } from "@/jobs/config";

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthPageShell />}>
      <SignUpContent />
    </Suspense>
  );
}

function SignUpContent() {
  const searchParams = useSearchParams();
  const jobBoardRedirectUrl = resolveJobBoardAuthRedirectUrl(
    searchParams.get("redirect_url")
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-enterprise-50">
      <SignUp
        fallbackRedirectUrl={jobBoardRedirectUrl ?? "/onboarding"}
        forceRedirectUrl={jobBoardRedirectUrl ?? undefined}
      />
    </div>
  );
}

function AuthPageShell() {
  return <div className="flex min-h-screen items-center justify-center bg-enterprise-50" />;
}
