import { describe, it, expect } from "vitest";
import { isFreeEmailProvider } from "@/lib/email-validation";

describe("isFreeEmailProvider", () => {
  it("returns true for gmail", () => {
    expect(isFreeEmailProvider("user@gmail.com")).toBe(true);
  });
  it("returns true for yahoo", () => {
    expect(isFreeEmailProvider("user@yahoo.com")).toBe(true);
  });
  it("returns false for corporate email", () => {
    expect(isFreeEmailProvider("user@sonata-software.com")).toBe(false);
  });
  it("returns true for empty domain", () => {
    expect(isFreeEmailProvider("invalid-email")).toBe(true);
  });
});
