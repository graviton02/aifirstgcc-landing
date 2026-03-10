import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;
    return await ctx.db
      .query("gccProfiles")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .unique();
  },
});

export const createProfile = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    organization: v.string(),
    industry: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query("gccProfiles")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .unique();
    if (existing) return existing._id;

    const now = Date.now();
    return await ctx.db.insert("gccProfiles", {
      ...args,
      user_id: userId,
      created_at: now,
      updated_at: now,
    });
  },
});
