"use client";

import { useState } from "react";
import { reportHandledError } from "@/lib/report-error";

type ApiResult = {
  error?: string;
  message?: string;
};

export function SentryTestPanel() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [status, setStatus] = useState<string>("");

  if (shouldThrow) {
    throw new Error("Local dev Sentry render test");
  }

  async function triggerHandledClientError() {
    try {
      throw new Error("Local dev Sentry handled client test");
    } catch (error) {
      reportHandledError(error, {
        tags: {
          area: "dev",
          feature: "sentry-test",
          route: "/dev/sentry-test",
        },
        extra: {
          kind: "handled-client",
        },
      });
      setStatus("Handled client event sent to Sentry.");
    }
  }

  async function triggerApiError(kind: "reported" | "throw") {
    const response = await fetch(`/api/dev/sentry-test?kind=${kind}`, {
      method: "POST",
    });

    const data = (await response.json().catch(() => ({}))) as ApiResult;
    setStatus(`${kind} API test returned ${response.status}: ${data.error ?? data.message ?? "No body"}`);
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/15 bg-black/30 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">Sentry Local Test</h1>
        <p className="text-sm leading-6 text-white/70">
          Use these controls only in local development to verify browser and server-side Sentry capture.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
          onClick={() => setShouldThrow(true)}
          type="button"
        >
          Trigger render error
        </button>

        <button
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white"
          onClick={triggerHandledClientError}
          type="button"
        >
          Trigger handled client error
        </button>

        <button
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white"
          onClick={() => triggerApiError("reported")}
          type="button"
        >
          Trigger reported API error
        </button>

        <button
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white"
          onClick={() => triggerApiError("throw")}
          type="button"
        >
          Trigger thrown API error
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        <p className="font-medium text-white">Expected results</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Render error should open the Next.js error UI and create a browser-side Sentry event.</li>
          <li>Handled client error should keep the page alive and still send a Sentry event.</li>
          <li>Reported API error should return a 500 JSON response and send a server-side Sentry event.</li>
          <li>Thrown API error should exercise uncaught request error capture.</li>
        </ul>
      </div>

      {status ? (
        <p className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          {status}
        </p>
      ) : null}
    </div>
  );
}
