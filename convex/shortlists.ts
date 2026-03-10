import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const shortlists = await ctx.db
      .query("agentShortlists")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .collect();
    const agents = await Promise.all(shortlists.map((s) => ctx.db.get(s.agent_id)));
    return agents.filter(Boolean);
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
