import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { resolveLogoUrl } from "./companyLogos";

type CardSyncCtx = Pick<MutationCtx, "db">;
type CardReadCtx =
  | Pick<QueryCtx, "storage">
  | Pick<MutationCtx, "storage">;

async function getCompanyPreviewFields(
  ctx: CardSyncCtx,
  companyId?: Id<"companies">,
  fallback?: {
    company_name?: string;
    company_slug?: string;
    company_logo_storage_id?: string;
    company_logo_url?: string;
    company_logo_bg?: string;
  }
) {
  if (!companyId) {
    return fallback ?? {};
  }

  const company = await ctx.db.get(companyId);
  if (!company) {
    return fallback ?? {};
  }

  return {
    company_name: company.name,
    company_slug: company.slug,
    company_logo_storage_id: company.logo_storage_id,
    company_logo_url: company.logo_url ?? undefined,
    company_logo_bg: company.logo_bg ?? undefined,
  };
}

async function buildAgentDirectoryCardDocument(
  ctx: CardSyncCtx,
  agent: Doc<"agents">
) {
  const companyFields = await getCompanyPreviewFields(ctx, agent.company_id, {
    company_name: agent.company_name,
    company_slug: agent.company_slug,
    company_logo_storage_id: agent.company_logo_storage_id,
    company_logo_url: agent.company_logo_url,
    company_logo_bg: agent.company_logo_bg,
  });

  return {
    agent_id: agent._id,
    slug: agent.slug,
    agent_name: agent.agent_name,
    tagline: agent.tagline,
    category: agent.category,
    company_id: agent.company_id,
    company_name: companyFields.company_name,
    company_slug: companyFields.company_slug,
    company_logo_storage_id: companyFields.company_logo_storage_id,
    company_logo_url: companyFields.company_logo_url,
    company_logo_bg: companyFields.company_logo_bg,
    functional_categories: agent.functional_categories,
    industry_categories: agent.industry_categories,
    infrastructure_categories: agent.infrastructure_categories,
    rating: agent.rating,
    review_count: agent.review_count,
    status: agent.status,
    search_text: agent.search_text,
    updated_at: agent.updated_at,
  };
}

export async function removeAgentDirectoryCard(
  ctx: CardSyncCtx,
  agentId: Id<"agents">
) {
  const existing = await ctx.db
    .query("agentDirectoryCards")
    .withIndex("by_agentId", (q) => q.eq("agent_id", agentId))
    .unique();

  if (existing) {
    await ctx.db.delete(existing._id);
  }
}

export async function syncAgentDirectoryCard(
  ctx: CardSyncCtx,
  agentId: Id<"agents">
) {
  const [agent, existing] = await Promise.all([
    ctx.db.get(agentId),
    ctx.db
      .query("agentDirectoryCards")
      .withIndex("by_agentId", (q) => q.eq("agent_id", agentId))
      .unique(),
  ]);

  if (!agent || agent.status !== "active") {
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  }

  const card = await buildAgentDirectoryCardDocument(ctx, agent);

  if (existing) {
    await ctx.db.patch(existing._id, card);
    return existing._id;
  }

  return await ctx.db.insert("agentDirectoryCards", card);
}

export async function syncAgentDirectoryCardsForCompany(
  ctx: CardSyncCtx,
  companyId: Id<"companies">
) {
  const agents = await ctx.db
    .query("agents")
    .withIndex("by_companyId", (q) => q.eq("company_id", companyId))
    .collect();

  for (const agent of agents) {
    await syncAgentDirectoryCard(ctx, agent._id);
  }
}

export async function backfillAgentDirectoryCards(ctx: CardSyncCtx) {
  const [agents, cards] = await Promise.all([
    ctx.db.query("agents").collect(),
    ctx.db.query("agentDirectoryCards").collect(),
  ]);

  const liveAgentIds = new Set<string>();
  let synced = 0;
  let removed = 0;

  for (const agent of agents) {
    liveAgentIds.add(String(agent._id));
    await syncAgentDirectoryCard(ctx, agent._id);
    synced += 1;
  }

  for (const card of cards) {
    if (!liveAgentIds.has(String(card.agent_id))) {
      await ctx.db.delete(card._id);
      removed += 1;
    }
  }

  return {
    scannedAgents: agents.length,
    synced,
    removed,
  };
}

export async function hydrateAgentDirectoryCard(
  ctx: CardReadCtx,
  card: Doc<"agentDirectoryCards">
) {
  return {
    _id: card.agent_id,
    slug: card.slug,
    agent_name: card.agent_name,
    tagline: card.tagline,
    category: card.category,
    company_id: card.company_id,
    company_name: card.company_name,
    company_slug: card.company_slug,
    company_logo_storage_id: card.company_logo_storage_id,
    company_logo_url: await resolveLogoUrl(
      ctx,
      card.company_logo_storage_id,
      card.company_logo_url
    ),
    company_logo_bg: card.company_logo_bg,
    functional_categories: card.functional_categories,
    industry_categories: card.industry_categories,
    infrastructure_categories: card.infrastructure_categories,
    rating: card.rating,
    review_count: card.review_count,
    status: card.status,
  };
}
