import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { search, limit }) => {
    const pageSize = limit ?? 20;
    if (search && search.trim()) {
      const results = await ctx.db
        .query("companies")
        .withSearchIndex("search_companies", (q) => q.search("name", search))
        .take(pageSize);
      return { data: results, count: results.length };
    }
    const all = await ctx.db.query("companies").collect();
    return { data: all.slice(0, pageSize), count: all.length };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const getById = query({
  args: { id: v.id("companies") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listAllSlugs = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("companies").collect();
    return all.map((c) => ({ slug: c.slug, updated_at: c.updated_at }));
  },
});

export const seed = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    website: v.string(),
    headquarters: v.string(),
    founded: v.optional(v.number()),
    company_size: v.string(),
    primary_verticals: v.array(v.string()),
    contact_email: v.optional(v.string()),
    verification_status: v.optional(v.string()),
    logo_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) return existing._id;

    const now = Date.now();
    return await ctx.db.insert("companies", {
      ...args,
      verification_status: (args.verification_status as "unverified" | "verified" | "flagged") ?? "unverified",
      claim_status: "unclaimed",
      created_at: now,
      updated_at: now,
    });
  },
});
