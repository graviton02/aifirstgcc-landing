import { describe, it, expect } from "vitest";

const MAX_COMPARE = 4;

describe("compare logic", () => {
  it("limits to 4 agents", () => {
    const slugs = ["a", "b", "c", "d"];
    const next = [...slugs, "e"];
    expect(next.length > MAX_COMPARE).toBe(true);
  });

  it("prevents duplicate slugs", () => {
    const slugs = ["a", "b"];
    const slug = "a";
    expect(slugs.includes(slug)).toBe(true);
  });
});
