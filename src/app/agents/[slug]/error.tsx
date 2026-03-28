"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { WarningCircle, ArrowLeft } from "@phosphor-icons/react";

export default function AgentDetailError({
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
      <main className="min-h-[100dvh] bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5">
            <WarningCircle weight="duotone" className="w-7 h-7 text-rose-500" />
          </div>
          <h2 className="font-display text-xl font-semibold text-enterprise-900 mb-2">
            Could not load agent
          </h2>
          <p className="text-sm text-enterprise-500 mb-6">
            We ran into an issue loading this agent. Try again or head back to
            the directory.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/directory"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-enterprise-200 text-sm font-medium text-enterprise-600 hover:bg-enterprise-50 active:scale-[0.98] transition-[transform,background-color] duration-200"
            >
              <ArrowLeft weight="bold" className="w-4 h-4" />
              Directory
            </Link>
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-lg bg-enterprise-900 text-white text-sm font-medium hover:bg-enterprise-800 active:scale-[0.98] transition-[transform,background-color] duration-200"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
