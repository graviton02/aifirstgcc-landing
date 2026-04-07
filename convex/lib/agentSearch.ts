import { buildAgentSearchText } from "./agentTaxonomy";

type AgentSearchDocumentInput = {
  agent_name: string;
  description: string;
  tagline?: string;
  category?: string;
  company_id?: any;
  company_name?: string;
  functional_categories?: readonly string[];
  industry_categories?: readonly string[];
  infrastructure_categories?: readonly string[];
  integrations?: readonly string[];
  expected_outcomes?: readonly string[];
  use_cases?: readonly {
    title: string;
    description: string;
  }[];
};

export type AgentDirectoryCompanyFields = {
  company_name?: string;
  company_slug?: string;
  company_logo_storage_id?: string;
  company_logo_url?: string;
  company_logo_bg?: string;
};

export async function buildAgentCompanyFields(
  ctx: { db: any },
  companyId?: any
): Promise<AgentDirectoryCompanyFields> {
  if (!companyId) {
    return {};
  }

  const company = await ctx.db.get(companyId);
  if (!company) {
    return {};
  }

  return {
    company_name: company.name,
    company_slug: company.slug,
    company_logo_storage_id: company.logo_storage_id,
    company_logo_url: company.logo_url ?? undefined,
    company_logo_bg: company.logo_bg ?? undefined,
  };
}

export async function buildAgentSearchTextForDocument(
  ctx: { db: any },
  input: AgentSearchDocumentInput
) {
  const company_name =
    input.company_name ??
    (input.company_id ? (await ctx.db.get(input.company_id))?.name : undefined);

  return buildAgentSearchText({
    agent_name: input.agent_name,
    description: input.description,
    tagline: input.tagline,
    company_name,
    category: input.category,
    functional_categories: input.functional_categories,
    industry_categories: input.industry_categories,
    infrastructure_categories: input.infrastructure_categories,
    integrations: input.integrations,
    expected_outcomes: input.expected_outcomes,
    use_cases: input.use_cases,
  });
}

export async function syncCompanyAgentSearchTexts(
  ctx: { db: any },
  companyId: any
) {
  const company = await ctx.db.get(companyId);
  if (!company) {
    return 0;
  }

  const agents = await ctx.db
    .query("agents")
    .withIndex("by_companyId", (q: any) => q.eq("company_id", companyId))
    .collect();

  let updated = 0;
  const now = Date.now();
  const nextCompanyFields = {
    company_name: company.name,
    company_slug: company.slug,
    company_logo_storage_id: company.logo_storage_id,
    company_logo_url: company.logo_url ?? undefined,
    company_logo_bg: company.logo_bg ?? undefined,
  };

  for (const agent of agents) {
    const nextSearchText = buildAgentSearchText({
      agent_name: agent.agent_name,
      description: agent.description,
      tagline: agent.tagline,
      company_name: company.name,
      category: agent.category,
      functional_categories: agent.functional_categories,
      industry_categories: agent.industry_categories,
      infrastructure_categories: agent.infrastructure_categories,
      integrations: agent.integrations,
      expected_outcomes: agent.expected_outcomes,
      use_cases: agent.use_cases,
    });

    if (
      (agent.search_text ?? "") === nextSearchText &&
      (agent.company_name ?? undefined) === nextCompanyFields.company_name &&
      (agent.company_slug ?? undefined) === nextCompanyFields.company_slug &&
      (agent.company_logo_storage_id ?? undefined) ===
        nextCompanyFields.company_logo_storage_id &&
      (agent.company_logo_url ?? undefined) === nextCompanyFields.company_logo_url &&
      (agent.company_logo_bg ?? undefined) === nextCompanyFields.company_logo_bg
    ) {
      continue;
    }

    await ctx.db.patch(agent._id, {
      search_text: nextSearchText,
      ...nextCompanyFields,
      updated_at: now,
    });
    updated += 1;
  }

  return updated;
}
