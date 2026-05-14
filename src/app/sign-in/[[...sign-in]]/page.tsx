"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { resolveJobBoardAuthRedirectUrl } from "@/jobs/config";

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthPageShell />}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const searchParams = useSearchParams();
  const jobBoardRedirectUrl = resolveJobBoardAuthRedirectUrl(
    searchParams.get("redirect_url")
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-enterprise-50">
      <SignIn
        fallbackRedirectUrl={jobBoardRedirectUrl ?? "/auth-redirect"}
        forceRedirectUrl={jobBoardRedirectUrl ?? undefined}
      />
    </div>
  );
}

function AuthPageShell() {
  return <div className="flex min-h-screen items-center justify-center bg-enterprise-50" />;
}
