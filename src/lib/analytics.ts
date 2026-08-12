import { track } from "@vercel/analytics";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

export function trackAnalytics(
  name: string,
  properties?: Record<string, string | number | boolean | null>,
) {
  if (!hasAnalyticsConsent()) return;
  track(name, properties);
}
