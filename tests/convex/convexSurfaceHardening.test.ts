import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import { createTestConvex } from "./testHarness";

const adminIdentity = {
  subject: "admin-user-id",
  email: "admin@example.com",
};
const nonAdminIdentity = {
  subject: "member-user-id",
  email: "member@example.com",
};

describe("convex surface hardening", () => {
  let t: ReturnType<typeof createTestConvex>;

  beforeEach(() => {
    process.env.ADMIN_CLERK_USER_IDS = adminIdentity.subject;
    t = createTestConvex();
  });

  it("rejects anonymous and non-admin access to remaining admin handlers", async () => {
    const submissionId = await t.run((ctx) =>
      ctx.db.insert("companySubmissions", {
        user_id: nonAdminIdentity.subject,
        contact_email: nonAdminIdentity.email,
        company_name: "Pending Company",
        website: "https://pending.example.com",
        description:
          "Pending company submission used to verify admin-only Convex entrypoints.",
        headquarters: "Bengaluru, India",
        logo_storage_id: "logo-1",
        primary_verticals: ["Technology"],
        initial_agent: {
          agent_name: "Pending Agent",
          tagline: "Admin-only approval gate",
          description: "Pending agent data for admin authorization coverage.",
          category: "Operations",
          functional_categories: ["IT Operations"],
          industry_categories: ["Technology"],
          use_cases: [
            {
              title: "Pending approval",
              description: "Used only for testing admin authorization.",
            },
          ],
          integrations: ["Slack"],
          expected_outcomes: ["Faster approval checks"],
          source_url: "https://example.com/source",
        },
        status: "pending",
        created_at: Date.now(),
        updated_at: Date.now(),
      })
    );

    await expect(t.query(api.admin.getPendingClaims, {})).rejects.toThrow(
      "Unauthenticated"
    );

    await expect(
      t.withIdentity(nonAdminIdentity).mutation(api.admin.approveCompanySubmission, {
        submission_id: submissionId,
      })
    ).rejects.toThrow("Admin access required");
  });

  it("keeps maintenance handlers out of the public generated api surface", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "convex-surface-"));
    const snippetPath = path.join(tempDir, "surface-check.ts");
    const apiImportPath = JSON.stringify(
      path.resolve(process.cwd(), "convex/_generated/api")
    );

    fs.writeFileSync(
      snippetPath,
      `import { api, internal } from ${apiImportPath};
void internal.agents.seed;
void internal.companies.seed;
void internal.agents.backfillTaxonomy;
void internal.agents.adminCleanup;
void internal.agents.fixQualityIssues;
void internal.agents.fixAgentTextFields;
void internal.admin.backfillLegacyProviderRequests;
void internal.admin.removeLegacyCompanySizeData;
// @ts-expect-error hardened maintenance handlers must not stay on api.*
void api.agents.seed;
// @ts-expect-error hardened maintenance handlers must not stay on api.*
void api.companies.seed;
// @ts-expect-error hardened maintenance handlers must not stay on api.*
void api.agents.backfillTaxonomy;
// @ts-expect-error hardened maintenance handlers must not stay on api.*
void api.agents.adminCleanup;
// @ts-expect-error hardened maintenance handlers must not stay on api.*
void api.agents.fixQualityIssues;
// @ts-expect-error hardened maintenance handlers must not stay on api.*
void api.agents.fixAgentTextFields;
// @ts-expect-error hardened maintenance handlers must not stay on api.*
void api.admin.backfillLegacyProviderRequests;
// @ts-expect-error hardened maintenance handlers must not stay on api.*
void api.admin.removeLegacyCompanySizeData;
`
    );

    expect(() =>
      execFileSync(
        "npx",
        [
          "tsc",
          "--noEmit",
          "--pretty",
          "false",
          "--target",
          "ES2020",
          "--module",
          "ESNext",
          "--moduleResolution",
          "bundler",
          "--skipLibCheck",
          snippetPath,
        ],
        {
          cwd: process.cwd(),
          stdio: "pipe",
        }
      )
    ).not.toThrow();
  });
});
