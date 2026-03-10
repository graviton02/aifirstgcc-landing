import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export const create = mutation({
  args: { company_id: v.id("companies"), payload: v.any() },
  handler: async (ctx, { company_id, payload }) => {
    const userId = await requireAuth(ctx);
    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .first();
    if (!membership || membership.company_id !== company_id || membership.status !== "active") {
      throw new Error("Not authorized to edit this company");
    }
    return await ctx.db.insert("companyEdits", {
      company_id,
      user_id: userId,
      payload,
      status: "pending",
      created_at: Date.now(),
    });
  },
});

export const getByCompany = query({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    return await ctx.db
      .query("companyEdits")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
  },
});
