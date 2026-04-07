"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { track } from "@vercel/analytics";

function roundMetricValue(value: number) {
  return Math.round(value * 100) / 100;
}

export function AppPerformanceTracker() {
  const pathname = usePathname();

  useReportWebVitals((metric: any) => {
    track("web_vital", {
      metric_name: String(metric.name),
      metric_value: roundMetricValue(Number(metric.value)),
      metric_rating:
        typeof metric.rating === "string" ? metric.rating : null,
      pathname,
    });
  });

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof PerformanceObserver === "undefined"
    ) {
      return;
    }

    let longTaskCount = 0;
    let longestTask = 0;
    let flushed = false;

    const flush = () => {
      if (flushed || longTaskCount === 0) {
        return;
      }

      flushed = true;
      track("long_task_summary", {
        pathname,
        long_task_count: longTaskCount,
        longest_task_ms: roundMetricValue(longestTask),
      });
    };

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        longTaskCount += 1;
        longestTask = Math.max(longestTask, entry.duration);
      }
    });

    try {
      observer.observe({ entryTypes: ["longtask"] });
    } catch {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      flush();
      observer.disconnect();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}
