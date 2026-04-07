import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchQueryMock = vi.fn();

vi.mock("convex/nextjs", () => ({
  fetchQuery: (...args: unknown[]) => fetchQueryMock(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("notFound");
  }),
}));

describe("CompanyProfilePage", () => {
  beforeEach(() => {
    fetchQueryMock.mockReset();
  });

  it("throws notFound for an unknown company slug", async () => {
    fetchQueryMock.mockResolvedValueOnce(null);

    const Page = (await import("@/app/companies/[slug]/page")).default;

    await expect(
      Page({ params: Promise.resolve({ slug: "missing-company" }) })
    ).rejects.toThrow("notFound");
  });

  it("builds metadata from the slug without querying Convex", async () => {
    const { generateMetadata } = await import("@/app/companies/[slug]/page");

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "alpha-sense" }),
    });

    expect(fetchQueryMock).not.toHaveBeenCalled();
    expect(metadata.title).toBe("Alpha Sense | Company Profile | Orbys360");
    expect(metadata.description).toContain("Alpha Sense");
    expect(metadata.alternates?.canonical).toBe(
      "https://orbys360.com/companies/alpha-sense"
    );
  });
});
