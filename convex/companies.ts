import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

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

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("companies").collect();
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

export const getByClerkOrgId = query({
  args: { clerk_org_id: v.string() },
  handler: async (ctx, { clerk_org_id }) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerk_org_id", clerk_org_id))
      .unique();
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
    contact_url: v.optional(v.string()),
    verification_status: v.optional(v.string()),
    logo_url: v.optional(v.string()),
    logo_bg: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) {
      const patch: Record<string, unknown> = {};
      if (args.logo_url && args.logo_url !== existing.logo_url) patch.logo_url = args.logo_url;
      if (args.logo_bg !== undefined && args.logo_bg !== existing.logo_bg) patch.logo_bg = args.logo_bg;
      if (args.contact_url && args.contact_url !== existing.contact_url) patch.contact_url = args.contact_url;
      if (Object.keys(patch).length > 0) {
        patch.updated_at = Date.now();
        await ctx.db.patch(existing._id, patch);
      }
      return existing._id;
    }

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

export const attachClerkOrganization = mutation({
  args: {
    company_id: v.id("companies"),
    clerk_org_id: v.string(),
  },
  handler: async (ctx, { company_id, clerk_org_id }) => {
    const userId = await requireAuth(ctx);
    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .collect();

    const activeMembership = membership.find(
      (entry) => entry.company_id === company_id && entry.role === "owner" && entry.status === "active"
    );
    if (!activeMembership) {
      throw new Error("Only the company owner can link a Clerk organization");
    }

    const existingCompany = await ctx.db.get(company_id);
    if (!existingCompany) throw new Error("Company not found");
    if (existingCompany.clerk_org_id && existingCompany.clerk_org_id !== clerk_org_id) {
      throw new Error("This company is already linked to a different Clerk organization");
    }

    const duplicateOrg = await ctx.db
      .query("companies")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerk_org_id", clerk_org_id))
      .unique();
    if (duplicateOrg && duplicateOrg._id !== company_id) {
      throw new Error("This Clerk organization is already linked to another company");
    }

    await ctx.db.patch(company_id, {
      clerk_org_id,
      updated_at: Date.now(),
    });

    return company_id;
  },
});
