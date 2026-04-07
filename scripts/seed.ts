import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import fs from "fs";
import path from "path";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error(
    "NEXT_PUBLIC_CONVEX_URL not set. Run with: NEXT_PUBLIC_CONVEX_URL=<url> npx tsx scripts/seed.ts"
  );
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const ROOT = path.resolve(import.meta.dirname, "..");
const COMPANIES_FILE = path.join(ROOT, "data/seed/companies.json");
const AGENTS_FILE = path.join(ROOT, "data/seed/agents.json");
const LOGOS_DIR = path.join(ROOT, "public/logos/companies");

interface SeedCompany {
  name: string;
  slug: string;
  website: string;
  headquarters: string;
  founded?: number;
  description: string;
  primary_verticals: string[];
  contact_email?: string;
  contact_url?: string;
  verification_status?: string;
  logo_bg?: string;
}

interface SeedAgent {
  agent_name: string;
  slug: string;
  company_slug: string;
  tagline?: string;
  description: string;
  category?: string;
  functional_categories?: string[];
  industry_categories?: string[];
  infrastructure_categories?: string[];
  use_cases?: { title: string; description: string }[];
  expected_outcomes?: string[];
  integrations?: string[];
  source_url?: string;
}

function findLogoUrl(slug: string): string | undefined {
  for (const ext of ["svg", "png", "webp", "jpg"]) {
    const filePath = path.join(LOGOS_DIR, `${slug}.${ext}`);
    if (fs.existsSync(filePath)) {
      return `/logos/companies/${slug}.${ext}`;
    }
  }
  return undefined;
}

async function main() {
  console.log("Reading seed data...");
  const companies: SeedCompany[] = JSON.parse(
    fs.readFileSync(COMPANIES_FILE, "utf-8")
  );
  const agents: SeedAgent[] = JSON.parse(
    fs.readFileSync(AGENTS_FILE, "utf-8")
  );

  console.log(
    `Found ${companies.length} companies and ${agents.length} agents\n`
  );

  // Phase 1: Seed companies
  console.log("=== Seeding Companies ===");
  const companyIdMap = new Map<string, string>();
  let companyNew = 0;

  for (const company of companies) {
    const logoUrl = findLogoUrl(company.slug);
    try {
      const id = await client.mutation(api.companies.seed, {
        slug: company.slug,
        name: company.name,
        description: company.description,
        website: company.website,
        headquarters: company.headquarters,
        founded: company.founded,
        primary_verticals: company.primary_verticals,
        contact_email: company.contact_email,
        verification_status: company.verification_status,
        logo_url: logoUrl,
        logo_bg: company.logo_bg,
        contact_url: company.contact_url,
      });
      companyIdMap.set(company.slug, id as string);
      console.log(
        `  ${company.name} (${company.slug}) ${logoUrl ? "+ logo" : ""}`
      );
      companyNew++;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  FAIL: ${company.name} — ${msg}`);
    }
  }
  console.log(`\nCompanies: ${companyNew} processed\n`);

  // Phase 2: Seed agents
  console.log("=== Seeding Agents ===");
  let agentNew = 0;
  let agentFailed = 0;

  for (const agent of agents) {
    const companyId = companyIdMap.get(agent.company_slug);
    if (!companyId) {
      console.error(
        `  SKIP: ${agent.agent_name} — company "${agent.company_slug}" not found`
      );
      agentFailed++;
      continue;
    }

    try {
      await client.mutation(api.agents.seed, {
        slug: agent.slug,
        agent_name: agent.agent_name,
        description: agent.description,
        company_id: companyId as any,
        tagline: agent.tagline,
        category: agent.category,
        functional_categories: agent.functional_categories,
        industry_categories: agent.industry_categories,
        use_cases: agent.use_cases,
        expected_outcomes: agent.expected_outcomes,
        integrations: agent.integrations,
        source_url: agent.source_url,
      });
      console.log(`  ${agent.agent_name} (${agent.slug})`);
      agentNew++;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  FAIL: ${agent.agent_name} — ${msg}`);
      agentFailed++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Companies: ${companyNew} processed`);
  console.log(`Agents: ${agentNew} processed, ${agentFailed} failed`);
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
