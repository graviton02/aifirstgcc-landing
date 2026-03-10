import { describe, it, expect } from "vitest";

// Unit tests for slug generation and data validation
// (Convex function integration tests require convex-test which we'll add later)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

describe("Company utilities", () => {
  it("generates correct slug from company name", () => {
    expect(slugify("Sonata Software")).toBe("sonata-software");
    expect(slugify("TCS & Partners")).toBe("tcs-partners");
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });
});
