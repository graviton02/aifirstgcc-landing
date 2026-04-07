import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { withResolvedLogoUrl } from "./lib/companyLogos";

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    return await ctx.db
      .query("agentShortlists")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .collect();
  },
});

export const isShortlisted = query({
  args: { agent_id: v.id("agents") },
  handler: async (ctx, { agent_id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const userId = identity.subject;
    const existing = await ctx.db
      .query("agentShortlists")
      .withIndex("by_userAndAgent", (q) => q.eq("user_id", userId).eq("agent_id", agent_id))
      .unique();
    return !!existing;
  },
});

export const add = mutation({
  args: { agent_id: v.id("agents") },
  handler: async (ctx, { agent_id }) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query("agentShortlists")
      .withIndex("by_userAndAgent", (q) => q.eq("user_id", userId).eq("agent_id", agent_id))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("agentShortlists", {
      user_id: userId,
      agent_id,
      created_at: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { agent_id: v.id("agents") },
  handler: async (ctx, { agent_id }) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query("agentShortlists")
      .withIndex("by_userAndAgent", (q) => q.eq("user_id", userId).eq("agent_id", agent_id))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const getMineWithDetails = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const shortlist = await ctx.db
      .query("agentShortlists")
      .withIndex("by_userId", (q) => q.eq("user_id", identity.subject))
      .collect();

    const rows = await Promise.all(
      shortlist.map(async (entry) => {
        const agent = await ctx.db.get(entry.agent_id);
        if (!agent) return null;

        const company = agent.company_id
          ? await withResolvedLogoUrl(ctx, await ctx.db.get(agent.company_id))
          : null;

        return {
          shortlistId: entry._id,
          agent,
          company,
          createdAt: entry.created_at,
        };
      }),
    );

    return rows
      .filter(
        (row): row is NonNullable<(typeof rows)[number]> => row !== null,
      )
      .sort((left, right) => right.createdAt - left.createdAt);
  },
});
