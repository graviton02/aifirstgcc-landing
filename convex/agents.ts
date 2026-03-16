import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export const list = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    functional_category: v.optional(v.string()),
    industry_category: v.optional(v.string()),
    infrastructure_category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const pageSize = args.limit ?? 12;

    if (args.search && args.search.trim()) {
      const results = await ctx.db
        .query("agents")
        .withSearchIndex("search_agents", (q) => {
          let sq = q.search("search_text", args.search!);
          sq = sq.eq("status", "active");
          if (args.category) sq = sq.eq("category", args.category);
          return sq;
        })
        .take(pageSize * 3);

      const filtered = applyFilters(results, args);
      return { data: filtered.slice(0, pageSize), count: filtered.length };
    }

    const q = ctx.db.query("agents").withIndex("by_status", (q) => q.eq("status", "active"));
    const all = await q.collect();
    const filtered = applyFilters(all, args);
    return { data: filtered.slice(0, pageSize), count: filtered.length };
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(agents: any[], args: any) {
  return agents.filter((a) => {
    if (args.category && a.category !== args.category) return false;
    if (args.functional_category && !a.functional_categories?.includes(args.functional_category)) return false;
    if (args.industry_category && !a.industry_categories?.includes(args.industry_category)) return false;
    if (args.infrastructure_category && !a.infrastructure_categories?.includes(args.infrastructure_category)) return false;
    return true;
  });
}

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("agents") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const getByIds = query({
  args: { ids: v.array(v.id("agents")) },
  handler: async (ctx, { ids }) => {
    const agents = await Promise.all(ids.map((id) => ctx.db.get(id)));
    return agents.filter(Boolean);
  },
});

export const getByCompany = query({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
  },
});

export const listAllSlugs = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    return all
      .filter((a) => a.slug)
      .map((a) => ({ slug: a.slug!, updated_at: a.updated_at }));
  },
});

export const getMySubmissions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return await ctx.db
      .query("agentSubmissions")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .collect();
  },
});

export const getMyEdits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return await ctx.db
      .query("agentEdits")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .collect();
  },
});

export const submit = mutation({
  args: {
    company_id: v.id("companies"),
    agent_name: v.string(),
    tagline: v.optional(v.string()),
    description: v.string(),
    category: v.string(),
    logo_url: v.optional(v.string()),
    use_cases: v.array(v.any()),
    functional_categories: v.optional(v.array(v.string())),
    industry_categories: v.optional(v.array(v.string())),
    infrastructure_categories: v.optional(v.array(v.string())),
    business_functions: v.optional(v.array(v.string())),
    expected_outcomes: v.optional(v.array(v.string())),
    integrations: v.optional(v.array(v.string())),
    demo_url: v.optional(v.string()),
    source_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();
    return await ctx.db.insert("agentSubmissions", {
      ...args,
      user_id: userId,
      submission_status: "pending",
      created_at: now,
      updated_at: now,
    });
  },
});

export const createEdit = mutation({
  args: {
    agent_id: v.id("agents"),
    payload: v.any(),
  },
  handler: async (ctx, { agent_id, payload }) => {
    const userId = await requireAuth(ctx);
    return await ctx.db.insert("agentEdits", {
      agent_id,
      user_id: userId,
      payload,
      status: "pending",
      created_at: Date.now(),
    });
  },
});

export const softDelete = mutation({
  args: { agent_id: v.id("agents") },
  handler: async (ctx, { agent_id }) => {
    await requireAuth(ctx);
    await ctx.db.patch(agent_id, { status: "inactive", updated_at: Date.now() });
  },
});

export const seed = mutation({
  args: {
    slug: v.string(),
    agent_name: v.string(),
    tagline: v.optional(v.string()),
    description: v.string(),
    company_id: v.id("companies"),
    category: v.optional(v.string()),
    functional_categories: v.optional(v.array(v.string())),
    industry_categories: v.optional(v.array(v.string())),
    infrastructure_categories: v.optional(v.array(v.string())),
    use_cases: v.optional(v.array(v.any())),
    business_functions: v.optional(v.array(v.string())),
    expected_outcomes: v.optional(v.array(v.string())),
    integrations: v.optional(v.array(v.string())),
    source_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) return existing._id;

    const now = Date.now();
    const searchText = [
      args.agent_name,
      args.description,
      args.tagline ?? "",
      args.category ?? "",
      ...(args.functional_categories ?? []),
      ...(args.industry_categories ?? []),
      ...(args.business_functions ?? []),
      ...(args.integrations ?? []),
      ...(args.expected_outcomes ?? []),
    ].join(" ");

    return await ctx.db.insert("agents", {
      slug: args.slug,
      agent_name: args.agent_name,
      tagline: args.tagline,
      description: args.description,
      category: args.category ?? "general",
      company_id: args.company_id,
      functional_categories: args.functional_categories,
      industry_categories: args.industry_categories,
      infrastructure_categories: args.infrastructure_categories,
      use_cases: args.use_cases ?? [],
      business_functions: args.business_functions,
      expected_outcomes: args.expected_outcomes,
      integrations: args.integrations,
      source_url: args.source_url,
      status: "active",
      search_text: searchText,
      created_at: now,
      updated_at: now,
    });
  },
});
