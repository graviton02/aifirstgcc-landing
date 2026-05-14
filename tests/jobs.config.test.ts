import { describe, expect, it } from "vitest";
import {
  buildJobBoardSignInUrl,
  resolveJobBoardAuthRedirectUrl,
  sanitizeJobBoardReturnUrl,
} from "../src/jobs/config";

describe("sanitizeJobBoardReturnUrl", () => {
  it("preserves internal job-board paths", () => {
    expect(sanitizeJobBoardReturnUrl("/jobs/post?draft=1")).toBe(
      "/jobs/post?draft=1"
    );
  });

  it("falls back for non-job-board paths", () => {
    expect(sanitizeJobBoardReturnUrl("/dashboard")).toBe("/jobs/dashboard");
  });

  it("falls back for external URLs", () => {
    expect(
      sanitizeJobBoardReturnUrl("https://example.com/jobs/post", "/jobs")
    ).toBe("/jobs");
  });
});

describe("resolveJobBoardAuthRedirectUrl", () => {
  it("wraps job-board destinations in the onboarding contract", () => {
    expect(resolveJobBoardAuthRedirectUrl("/jobs/post")).toBe(
      "/jobs/onboarding?returnUrl=%2Fjobs%2Fpost"
    );
  });

  it("preserves existing job-board onboarding redirects", () => {
    expect(
      resolveJobBoardAuthRedirectUrl(
        "/jobs/onboarding?returnUrl=%2Fjobs%2Fai-qa-role"
      )
    ).toBe("/jobs/onboarding?returnUrl=%2Fjobs%2Fai-qa-role");
  });

  it("ignores non-job-board destinations", () => {
    expect(resolveJobBoardAuthRedirectUrl("/dashboard")).toBeNull();
  });
});

describe("buildJobBoardSignInUrl", () => {
  it("preserves apply routes through sign-in", () => {
    expect(buildJobBoardSignInUrl("/jobs/ai-qa-e2e-role/apply")).toBe(
      "/sign-in?redirect_url=%2Fjobs%2Fai-qa-e2e-role%2Fapply"
    );
  });

  it("falls back to the job dashboard for unsafe destinations", () => {
    expect(buildJobBoardSignInUrl("https://example.com/jobs/post")).toBe(
      "/sign-in?redirect_url=%2Fjobs%2Fdashboard"
    );
  });
});
