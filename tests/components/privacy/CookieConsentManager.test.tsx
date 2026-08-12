import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CookieConsentManager } from "@/components/privacy/CookieConsentManager";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  createCookieConsentPreferences,
  openCookieSettings,
  parseCookieConsent,
} from "@/lib/cookie-consent";

let mockPathname = "/orbys360";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("@vercel/analytics/next", () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));

vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => <div data-testid="speed-insights" />,
}));

vi.mock("@/components/analytics/AppPerformanceTracker", () => ({
  AppPerformanceTracker: () => <div data-testid="performance-tracker" />,
}));

vi.mock("@/components/analytics/LinkedInInsightTag", () => ({
  LinkedInInsightTag: () => <div data-testid="linkedin-insight" />,
}));

describe("CookieConsentManager", () => {
  beforeEach(() => {
    mockPathname = "/orbys360";
    localStorage.clear();
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
    });
  });

  it("keeps the platform selector free of Orbys360 consent and tracking", async () => {
    mockPathname = "/";
    localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(
        createCookieConsentPreferences({ analytics: true, marketing: true }),
      ),
    );

    render(<CookieConsentManager />);

    await waitFor(() => {
      expect(screen.queryByRole("region", { name: /cookie consent/i })).not.toBeInTheDocument();
    });
    expect(screen.queryByTestId("vercel-analytics")).not.toBeInTheDocument();
    expect(screen.queryByTestId("linkedin-insight")).not.toBeInTheDocument();
  });

  it("shows privacy choices without loading optional services", async () => {
    render(<CookieConsentManager />);

    expect(await screen.findByRole("region", { name: /cookie consent/i })).toBeVisible();
    expect(screen.queryByTestId("vercel-analytics")).not.toBeInTheDocument();
    expect(screen.queryByTestId("linkedin-insight")).not.toBeInTheDocument();
  });

  it("rejects all optional services in one action", async () => {
    render(<CookieConsentManager />);
    fireEvent.click(await screen.findByRole("button", { name: /reject optional/i }));

    const stored = parseCookieConsent(
      localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY),
    );
    expect(stored).toMatchObject({ analytics: false, marketing: false });
    expect(screen.queryByRole("region", { name: /cookie consent/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("vercel-analytics")).not.toBeInTheDocument();
    expect(screen.queryByTestId("linkedin-insight")).not.toBeInTheDocument();
  });

  it("loads analytics and marketing only after accepting all", async () => {
    render(<CookieConsentManager />);
    fireEvent.click(await screen.findByRole("button", { name: /accept all/i }));

    expect(await screen.findByTestId("vercel-analytics")).toBeInTheDocument();
    expect(screen.getByTestId("speed-insights")).toBeInTheDocument();
    expect(screen.getByTestId("performance-tracker")).toBeInTheDocument();
    expect(screen.getByTestId("linkedin-insight")).toBeInTheDocument();
  });

  it("supports granular choices and reopening settings", async () => {
    render(<CookieConsentManager />);
    fireEvent.click(await screen.findByRole("button", { name: /manage choices/i }));

    const dialog = screen.getByRole("dialog", { name: /cookie preferences/i });
    expect(dialog).toBeVisible();
    fireEvent.click(screen.getByRole("checkbox", { name: /analytics/i }));
    fireEvent.click(screen.getByRole("button", { name: /save choices/i }));

    expect(await screen.findByTestId("vercel-analytics")).toBeInTheDocument();
    expect(screen.queryByTestId("linkedin-insight")).not.toBeInTheDocument();

    openCookieSettings();
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: /cookie preferences/i })).toBeVisible();
    });
    expect(screen.getByRole("checkbox", { name: /analytics/i })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /marketing/i })).not.toBeChecked();
  });
});
