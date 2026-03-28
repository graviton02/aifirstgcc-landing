import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConvexError } from "convex/values";

const {
  captureExceptionMock,
  setExtrasMock,
  setFingerprintMock,
  setLevelMock,
  setTagMock,
  setUserMock,
  withScopeMock,
} = vi.hoisted(() => ({
  captureExceptionMock: vi.fn(),
  setExtrasMock: vi.fn(),
  setFingerprintMock: vi.fn(),
  setLevelMock: vi.fn(),
  setTagMock: vi.fn(),
  setUserMock: vi.fn(),
  withScopeMock: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: captureExceptionMock,
  withScope: withScopeMock,
}));

import { getErrorMessage, getErrorStatus, reportHandledError } from "@/lib/report-error";

describe("report-error helpers", () => {
  beforeEach(() => {
    captureExceptionMock.mockReset();
    setExtrasMock.mockReset();
    setFingerprintMock.mockReset();
    setLevelMock.mockReset();
    setTagMock.mockReset();
    setUserMock.mockReset();
    withScopeMock.mockReset();

    withScopeMock.mockImplementation((callback: (scope: unknown) => void) => {
      callback({
        setLevel: setLevelMock,
        setTag: setTagMock,
        setExtras: setExtrasMock,
        setFingerprint: setFingerprintMock,
        setUser: setUserMock,
      });
    });
  });

  it("reads the structured message and status from ConvexError payloads", () => {
    const error = new ConvexError({
      code: "invite_member_pending",
      message: "Uncaught Error: An invite is already pending for that email",
      status: 400,
    });

    expect(getErrorMessage(error, "Fallback")).toBe("An invite is already pending for that email");
    expect(getErrorStatus(error)).toBe(400);
  });

  it("falls back when a thrown value has no useful message", () => {
    expect(getErrorMessage({ data: { status: 409 } }, "Fallback")).toBe("Fallback");
    expect(getErrorStatus(new Error("boom"))).toBeNull();
  });

  it("reports handled errors with normalized messages and context", () => {
    const error = Object.assign(new Error("Server Error"), {
      data: {
        code: "claim_link_expired",
        message: "Uncaught Error: This activation link has expired",
        status: 400,
      },
    });

    const exception = reportHandledError(error, {
      tags: {
        feature: "claim-activate",
        route: "/claim/activate",
      },
      extra: {
        claimId: "claim_123",
      },
      fingerprint: ["claim-activate", "claim_link_expired"],
      userId: "user_123",
    });

    expect(exception.message).toBe("This activation link has expired");
    expect(withScopeMock).toHaveBeenCalledTimes(1);
    expect(setLevelMock).toHaveBeenCalledWith("error");
    expect(setTagMock).toHaveBeenCalledWith("handled", "true");
    expect(setTagMock).toHaveBeenCalledWith("feature", "claim-activate");
    expect(setTagMock).toHaveBeenCalledWith("route", "/claim/activate");
    expect(setExtrasMock).toHaveBeenCalledWith({ claimId: "claim_123" });
    expect(setFingerprintMock).toHaveBeenCalledWith(["claim-activate", "claim_link_expired"]);
    expect(setUserMock).toHaveBeenCalledWith({ id: "user_123" });
    expect(captureExceptionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "This activation link has expired",
        name: "Error",
      })
    );
  });
});
