import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("notFound");
  }),
}));

describe("CategoryPage", () => {
  it("throws notFound for an unknown category slug", async () => {
    const Page = (await import("@/app/categories/[slug]/page")).default;

    await expect(
      Page({ params: Promise.resolve({ slug: "missing-category" }) })
    ).rejects.toThrow("notFound");
  });
});
