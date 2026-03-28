"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { WarningCircle } from "@phosphor-icons/react";

export default function DirectoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-enterprise-50/50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5">
            <WarningCircle weight="duotone" className="w-7 h-7 text-rose-500" />
          </div>
          <h2 className="font-display text-xl font-semibold text-enterprise-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-enterprise-500 mb-6">
            We could not load the agent directory. This may be a temporary issue.
          </p>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-enterprise-900 text-white text-sm font-medium hover:bg-enterprise-800 active:scale-[0.98] transition-[transform,background-color] duration-200"
          >
            Try again
          </button>
        </div>
      </main>
    </>
  );
}
