import { describe, expect, it } from "vitest";
import { isValidLinkedInUrl, normalizeLinkedInUrl } from "@/jobs/config";

describe("isValidLinkedInUrl", () => {
  it("accepts canonical LinkedIn profile URLs", () => {
    expect(isValidLinkedInUrl("https://www.linkedin.com/in/jane-doe")).toBe(true);
    expect(isValidLinkedInUrl("https://linkedin.com/in/jane_doe-1/")).toBe(true);
  });

  it("rejects unsafe or non-profile URLs", () => {
    expect(isValidLinkedInUrl("http://www.linkedin.com/in/jane")).toBe(false);
    expect(isValidLinkedInUrl("https://github.com/jane")).toBe(false);
    expect(isValidLinkedInUrl("https://www.linkedin.com/company/orbys")).toBe(false);
    expect(isValidLinkedInUrl("")).toBe(false);
    expect(isValidLinkedInUrl(null)).toBe(false);
    expect(isValidLinkedInUrl(undefined)).toBe(false);
  });
});

describe("normalizeLinkedInUrl", () => {
  it("trims and prefixes missing protocols", () => {
    expect(normalizeLinkedInUrl("  www.linkedin.com/in/jane  ")).toBe(
      "https://www.linkedin.com/in/jane"
    );
    expect(normalizeLinkedInUrl("linkedin.com/in/jane")).toBe(
      "https://linkedin.com/in/jane"
    );
  });

  it("upgrades http and preserves https", () => {
    expect(normalizeLinkedInUrl("http://www.linkedin.com/in/jane")).toBe(
      "https://www.linkedin.com/in/jane"
    );
    expect(normalizeLinkedInUrl("https://www.linkedin.com/in/jane")).toBe(
      "https://www.linkedin.com/in/jane"
    );
  });

  it("returns an empty string for empty input", () => {
    expect(normalizeLinkedInUrl("")).toBe("");
    expect(normalizeLinkedInUrl(null)).toBe("");
    expect(normalizeLinkedInUrl(undefined)).toBe("");
  });
});
