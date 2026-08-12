export const COOKIE_CONSENT_STORAGE_KEY = "orbys360-cookie-consent";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 180;
export const COOKIE_CONSENT_CHANGED_EVENT = "orbys360:cookie-consent-changed";
export const OPEN_COOKIE_SETTINGS_EVENT = "orbys360:open-cookie-settings";

export interface CookieConsentPreferences {
  version: typeof COOKIE_CONSENT_VERSION;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  expiresAt: string;
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function createCookieConsentPreferences(
  preferences: Pick<CookieConsentPreferences, "analytics" | "marketing">,
  now = new Date(),
): CookieConsentPreferences {
  return {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + COOKIE_CONSENT_MAX_AGE_MS).toISOString(),
  };
}

export function parseCookieConsent(
  value: string | null,
  now = new Date(),
): CookieConsentPreferences | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("version" in parsed) ||
      parsed.version !== COOKIE_CONSENT_VERSION ||
      !("necessary" in parsed) ||
      parsed.necessary !== true ||
      !("analytics" in parsed) ||
      !isBoolean(parsed.analytics) ||
      !("marketing" in parsed) ||
      !isBoolean(parsed.marketing) ||
      !("updatedAt" in parsed) ||
      typeof parsed.updatedAt !== "string" ||
      !("expiresAt" in parsed) ||
      typeof parsed.expiresAt !== "string"
    ) {
      return null;
    }

    const expiresAt = Date.parse(parsed.expiresAt);
    if (!Number.isFinite(expiresAt) || expiresAt <= now.getTime()) {
      return null;
    }

    return parsed as CookieConsentPreferences;
  } catch {
    return null;
  }
}

export function readCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const storedValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    const preferences = parseCookieConsent(storedValue);

    if (storedValue && !preferences) {
      window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    }

    return preferences;
  } catch {
    return null;
  }
}

export function writeCookieConsent(preferences: CookieConsentPreferences) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  } catch {
    // Some privacy modes disable storage. Keep the choice for the current page
    // through the event and in-memory React state without breaking the site.
  }
  window.dispatchEvent(
    new CustomEvent<CookieConsentPreferences>(COOKIE_CONSENT_CHANGED_EVENT, {
      detail: preferences,
    }),
  );
}

export function hasAnalyticsConsent() {
  return readCookieConsent()?.analytics === true;
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}
