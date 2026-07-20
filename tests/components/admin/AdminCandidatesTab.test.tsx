import { describe, expect, it, vi } from "vitest";

vi.mock("convex/react", () => ({
  useQuery: () => undefined,
  useMutation: () => vi.fn(),
}));

const lead = {
  _id: "lead_1" as never,
  full_name: 'Ravi "Rav" Menon',
  email: "ravi@example.com",
  current_title: "Senior ML Engineer, Platform",
  years_experience: "6-10",
  job_category: "ai-ml",
  profile_url: "https://www.linkedin.com/in/ravi-menon",
  source: "linkedin",
  status: "new",
  created_at: Date.UTC(2026, 6, 20),
};

describe("buildCandidateCsv", () => {
  it("emits a header row and one quoted row per lead", async () => {
    const { buildCandidateCsv } = await import(
      "@/components/admin/AdminCandidatesTab"
    );

    const csv = buildCandidateCsv([lead]);
    const [header, row] = csv.split("\n");

    expect(header).toBe(
      "Name,Email,Title,Experience,Category,Profile URL,Source,Status,Signed up"
    );
    expect(row).toContain('"6-10 years"');
    expect(row).toContain('"AI / ML"');
    expect(row).toContain('"linkedin"');
  });

  it("escapes embedded quotes and commas so the CSV stays parseable", async () => {
    const { buildCandidateCsv } = await import(
      "@/components/admin/AdminCandidatesTab"
    );

    const row = buildCandidateCsv([lead]).split("\n")[1];

    expect(row).toContain('"Ravi ""Rav"" Menon"');
    expect(row).toContain('"Senior ML Engineer, Platform"');
  });

  it("renders an empty cell for a lead without a profile URL", async () => {
    const { buildCandidateCsv } = await import(
      "@/components/admin/AdminCandidatesTab"
    );

    const row = buildCandidateCsv([
      { ...lead, profile_url: undefined },
    ]).split("\n")[1];

    expect(row).toContain(',"",');
  });
});
