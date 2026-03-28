"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="min-h-[100dvh] bg-white flex items-center justify-center px-4">
        <main className="w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5">
            <span className="text-rose-500 text-2xl leading-none">!</span>
          </div>
          <h1 className="font-display text-xl font-semibold text-enterprise-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-enterprise-500 mb-6">
            We hit an unexpected error while rendering this page.
          </p>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-enterprise-900 text-white text-sm font-medium hover:bg-enterprise-800 active:scale-[0.98] transition-[transform,background-color] duration-200"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
