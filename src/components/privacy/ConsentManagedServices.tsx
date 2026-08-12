"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppPerformanceTracker } from "@/components/analytics/AppPerformanceTracker";
import { LinkedInInsightTag } from "@/components/analytics/LinkedInInsightTag";
import type { CookieConsentPreferences } from "@/lib/cookie-consent";

interface ConsentManagedServicesProps {
  consent: CookieConsentPreferences | null;
}

export function ConsentManagedServices({ consent }: ConsentManagedServicesProps) {
  return (
    <>
      {consent?.analytics ? (
        <>
          <Analytics />
          <SpeedInsights />
          <AppPerformanceTracker />
        </>
      ) : null}
      {consent?.marketing ? <LinkedInInsightTag /> : null}
    </>
  );
}
