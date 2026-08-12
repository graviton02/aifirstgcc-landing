import { beforeEach, describe, expect, it } from "vitest";
import {
  COOKIE_CONSENT_MAX_AGE_MS,
  COOKIE_CONSENT_STORAGE_KEY,
  createCookieConsentPreferences,
  hasAnalyticsConsent,
  parseCookieConsent,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/cookie-consent";

describe("cookie consent storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a versioned preference that expires after 180 days", () => {
    const now = new Date("2026-08-10T00:00:00.000Z");
    const consent = createCookieConsentPreferences(
      { analytics: true, marketing: false },
      now,
    );

    expect(consent).toMatchObject({
      version: 1,
      necessary: true,
      analytics: true,
      marketing: false,
      updatedAt: now.toISOString(),
    });
    expect(Date.parse(consent.expiresAt) - now.getTime()).toBe(
      COOKIE_CONSENT_MAX_AGE_MS,
    );
  });

  it("rejects malformed, expired, and old-version preferences", () => {
    const now = new Date("2026-08-10T00:00:00.000Z");
    const expired = createCookieConsentPreferences(
      { analytics: true, marketing: true },
      new Date("2025-01-01T00:00:00.000Z"),
    );

    expect(parseCookieConsent("not-json", now)).toBeNull();
    expect(parseCookieConsent(JSON.stringify(expired), now)).toBeNull();
    expect(
      parseCookieConsent(JSON.stringify({ ...expired, version: 0 }), now),
    ).toBeNull();
  });

  it("persists valid preferences and exposes analytics consent", () => {
    const consent = createCookieConsentPreferences({
      analytics: true,
      marketing: false,
    });

    writeCookieConsent(consent);

    expect(readCookieConsent()).toEqual(consent);
    expect(hasAnalyticsConsent()).toBe(true);
    expect(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).not.toBeNull();
  });

  it("removes invalid stored preferences", () => {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "invalid");

    expect(readCookieConsent()).toBeNull();
    expect(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBeNull();
  });

  it("does not break the page when browser storage is unavailable", () => {
    const getItem = localStorage.getItem;
    const setItem = localStorage.setItem;
    localStorage.getItem = () => {
      throw new Error("storage blocked");
    };
    localStorage.setItem = () => {
      throw new Error("storage blocked");
    };

    const consent = createCookieConsentPreferences({
      analytics: false,
      marketing: false,
    });

    expect(readCookieConsent()).toBeNull();
    expect(() => writeCookieConsent(consent)).not.toThrow();

    localStorage.getItem = getItem;
    localStorage.setItem = setItem;
  });
});
