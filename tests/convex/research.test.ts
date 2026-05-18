import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import { createTestConvex } from "./testHarness";

describe("research lead workflows", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    t = createTestConvex();
  });

  it("stores a gated research lead and returns a download URL", async () => {
    const result = await t.mutation(api.research.submitResearchLead, {
      report_slug: "the-gcc-reckoning",
      full_name: "Priya Sharma",
      position: "Director, GCC Operations",
      email: "priya@enterprise.example",
      industry: "Technology",
      user_agent: "vitest",
    });

    expect(result.ok).toBe(true);
    expect(result.download_url).toContain("/research/download?token=");

    const leads = await t.run((ctx) => ctx.db.query("researchLeads").collect());
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({
      report_slug: "the-gcc-reckoning",
      full_name: "Priya Sharma",
      position: "Director, GCC Operations",
      email: "priya@enterprise.example",
      industry: "Technology",
      user_agent: "vitest",
      download_count: 0,
    });
    expect(leads[0]?.download_token).toBeTruthy();
    expect(result.download_url).toContain(leads[0]?.download_token);
  });

  it("looks up and records report downloads by token", async () => {
    const result = await t.mutation(api.research.submitResearchLead, {
      report_slug: "the-gcc-reckoning",
      full_name: "Priya Sharma",
      position: "Director",
      email: "download@enterprise.example",
      industry: "Technology",
    });
    const token = new URL(result.download_url).searchParams.get("token");

    expect(token).toBeTruthy();

    const lead = await t.query(api.research.getLeadByToken, { token: token! });
    expect(lead?.report_slug).toBe("the-gcc-reckoning");

    await t.mutation(api.research.recordDownload, { token: token! });

    const storedLead = await t.run((ctx) =>
      ctx.db
        .query("researchLeads")
        .withIndex("by_token", (q) => q.eq("download_token", token!))
        .first()
    );
    expect(storedLead?.download_count).toBe(1);
    expect(storedLead?.last_downloaded_at).toEqual(expect.any(Number));
  });

  it("rejects free email providers with a structured error", async () => {
    await expect(
      t.mutation(api.research.submitResearchLead, {
        report_slug: "the-gcc-reckoning",
        full_name: "Priya Sharma",
        position: "Director",
        email: "priya@gmail.com",
        industry: "Technology",
      })
    ).rejects.toThrow("research_email_free_provider");
  });
});
