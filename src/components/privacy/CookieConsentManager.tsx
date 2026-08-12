"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsentManagedServices } from "@/components/privacy/ConsentManagedServices";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  OPEN_COOKIE_SETTINGS_EVENT,
  createCookieConsentPreferences,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent";

type ConsentState = CookieConsentPreferences | null | undefined;

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function CookieConsentManager() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentState>(undefined);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setConsent(readCookieConsent());

    const handleConsentChange = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentPreferences>).detail;
      setConsent(detail ?? readCookieConsent());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_STORAGE_KEY) {
        setConsent(readCookieConsent());
      }
    };
    const handleOpenSettings = () => setIsPreferencesOpen(true);

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    };
  }, []);

  useEffect(() => {
    if (!isPreferencesOpen) return;

    setAnalytics(consent?.analytics ?? false);
    setMarketing(consent?.marketing ?? false);
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [consent, isPreferencesOpen]);

  const closePreferences = useCallback(() => setIsPreferencesOpen(false), []);

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closePreferences();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusableElements = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    );
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === dialogRef.current)
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const commitConsent = (nextAnalytics: boolean, nextMarketing: boolean) => {
    const nextConsent = createCookieConsentPreferences({
      analytics: nextAnalytics,
      marketing: nextMarketing,
    });
    const requiresCleanReload = Boolean(
      consent &&
        ((consent.analytics && !nextAnalytics) ||
          (consent.marketing && !nextMarketing)),
    );

    writeCookieConsent(nextConsent);
    setConsent(nextConsent);
    setIsPreferencesOpen(false);

    if (requiresCleanReload && process.env.NODE_ENV !== "test") {
      window.location.reload();
    }
  };

  // The platform selector is a neutral gateway. Consent and optional Orbys360
  // services begin only after a visitor enters the Orbys360 website.
  if (pathname === "/" || pathname === "/explore") return null;

  return (
    <>
      <ConsentManagedServices consent={consent ?? null} />

      {consent === null && !isPreferencesOpen ? (
        <section
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-5xl rounded-2xl border border-enterprise-200 bg-white p-5 shadow-[0_20px_70px_-20px_rgba(30,15,55,0.45)] sm:inset-x-6 sm:bottom-6 sm:p-6"
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-2xl gap-3">
              <div className="mt-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 sm:flex">
                <ShieldCheck aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-enterprise-950">
                  Your privacy choices
                </h2>
                <p className="mt-1 text-sm leading-6 text-enterprise-600">
                  We use necessary storage to run the site. With your permission, we
                  also use analytics to improve Orbys360 and LinkedIn technology to
                  measure campaigns. You can change your choice at any time.{" "}
                  <Link
                    href="/cookie-policy"
                    className="font-semibold text-purple-700 underline decoration-purple-300 underline-offset-2 hover:text-purple-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                  >
                    Read our cookie policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto">
              <Button variant="secondary" onClick={() => commitConsent(false, false)}>
                Reject optional
              </Button>
              <Button variant="secondary" onClick={() => setIsPreferencesOpen(true)}>
                Manage choices
              </Button>
              <Button onClick={() => commitConsent(true, true)}>Accept all</Button>
            </div>
          </div>
        </section>
      ) : null}

      {isPreferencesOpen ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-enterprise-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            aria-describedby="cookie-preferences-description"
            tabIndex={-1}
            onKeyDown={handleDialogKeyDown}
            className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-enterprise-100 bg-white px-5 py-5 sm:px-7">
              <div className="pr-4">
                <h2
                  id="cookie-preferences-title"
                  className="text-xl font-bold text-enterprise-950"
                >
                  Cookie preferences
                </h2>
                <p
                  id="cookie-preferences-description"
                  className="mt-1 text-sm leading-6 text-enterprise-600"
                >
                  Choose which optional technologies Orbys360 may use.
                </p>
              </div>
              <button
                type="button"
                onClick={closePreferences}
                aria-label="Close cookie preferences"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-enterprise-600 transition-colors hover:bg-enterprise-100 hover:text-enterprise-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 px-5 py-5 sm:px-7 sm:py-6">
              <div className="rounded-2xl border border-enterprise-200 bg-enterprise-50 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-enterprise-950">Necessary</h3>
                    <p className="mt-1 text-sm leading-6 text-enterprise-600">
                      Required for security, authentication, your privacy choice, and
                      features you explicitly request.
                    </p>
                  </div>
                  <span className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-3 text-xs font-bold text-emerald-800">
                    <Check aria-hidden="true" className="h-3.5 w-3.5" /> Always on
                  </span>
                </div>
              </div>

              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-enterprise-200 p-4 transition-colors hover:border-purple-300 hover:bg-purple-50/40 sm:p-5">
                <span>
                  <span className="block font-bold text-enterprise-950">Analytics</span>
                  <span className="mt-1 block text-sm leading-6 text-enterprise-600">
                    Helps us understand page use and performance through Vercel
                    Analytics and Speed Insights.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                  className="mt-1 h-6 w-6 shrink-0 accent-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
                />
              </label>

              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-enterprise-200 p-4 transition-colors hover:border-purple-300 hover:bg-purple-50/40 sm:p-5">
                <span>
                  <span className="block font-bold text-enterprise-950">Marketing</span>
                  <span className="mt-1 block text-sm leading-6 text-enterprise-600">
                    Allows the LinkedIn Insight Tag to measure campaigns and build
                    advertising audiences.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(event) => setMarketing(event.target.checked)}
                  className="mt-1 h-6 w-6 shrink-0 accent-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
                />
              </label>

              <p className="px-1 pt-1 text-xs leading-5 text-enterprise-500">
                Learn more about each service, the information it receives, and how
                long your choice is kept in our{" "}
                <Link
                  href="/cookie-policy"
                  className="font-semibold text-purple-700 underline underline-offset-2"
                >
                  cookie policy
                </Link>
                .
              </p>
            </div>

            <div className="sticky bottom-0 z-10 grid grid-cols-2 gap-2 border-t border-enterprise-100 bg-white px-5 py-5 sm:flex sm:justify-end sm:px-7">
              <Button variant="secondary" onClick={() => commitConsent(false, false)}>
                Reject optional
              </Button>
              <Button onClick={() => commitConsent(analytics, marketing)}>
                Save choices
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
