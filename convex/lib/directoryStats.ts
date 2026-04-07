import type { MutationCtx, QueryCtx } from "../_generated/server";

type StatsCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

export const DIRECTORY_STATS_KEY = "global";

export function buildDirectoryCategoryCounts(
  agents: Array<{
    functional_categories?: string[];
    industry_categories?: string[];
    infrastructure_categories?: string[];
  }>
) {
  const counts: Record<string, number> = {};

  for (const agent of agents) {
    for (const category of agent.functional_categories ?? []) {
      counts[category] = (counts[category] ?? 0) + 1;
    }

    for (const category of agent.industry_categories ?? []) {
      counts[category] = (counts[category] ?? 0) + 1;
    }

    for (const category of agent.infrastructure_categories ?? []) {
      counts[category] = (counts[category] ?? 0) + 1;
    }
  }

  return counts;
}

export async function collectDirectoryStats(ctx: StatsCtx) {
  const [activeAgents, companies] = await Promise.all([
    ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect(),
    ctx.db.query("companies").collect(),
  ]);

  return {
    total_active_agents: activeAgents.length,
    company_count: companies.length,
    category_counts: buildDirectoryCategoryCounts(activeAgents),
  };
}

export async function getDirectoryStatsSnapshot(ctx: StatsCtx) {
  const existing = await ctx.db
    .query("directoryStats")
    .withIndex("by_key", (q) => q.eq("key", DIRECTORY_STATS_KEY))
    .unique();

  if (existing) {
    return existing;
  }

  const collected = await collectDirectoryStats(ctx);

  return {
    _id: "directory-stats-missing",
    _creationTime: 0,
    key: DIRECTORY_STATS_KEY,
    updated_at: Date.now(),
    ...collected,
  };
}

export async function rebuildDirectoryStats(ctx: MutationCtx) {
  const snapshot = await collectDirectoryStats(ctx);
  const existing = await ctx.db
    .query("directoryStats")
    .withIndex("by_key", (q) => q.eq("key", DIRECTORY_STATS_KEY))
    .unique();

  const nextDocument = {
    key: DIRECTORY_STATS_KEY,
    total_active_agents: snapshot.total_active_agents,
    company_count: snapshot.company_count,
    category_counts: snapshot.category_counts,
    updated_at: Date.now(),
  };

  if (existing) {
    await ctx.db.patch(existing._id, nextDocument);
    return { ...existing, ...nextDocument };
  }

  const insertedId = await ctx.db.insert("directoryStats", nextDocument);
  return {
    _id: insertedId,
    _creationTime: Date.now(),
    ...nextDocument,
  };
}
