import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export const getMyCompany = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;
    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .first();
    if (!membership || membership.status !== "active") return null;
    const company = await ctx.db.get(membership.company_id);
    return { membership, company };
  },
});

export const getMembers = query({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    return await ctx.db
      .query("companyMembers")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
  },
});

export const inviteMember = mutation({
  args: { company_id: v.id("companies"), email: v.string() },
  handler: async (ctx, { company_id, email }) => {
    const userId = await requireAuth(ctx);
    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .first();
    if (!membership || membership.company_id !== company_id || membership.role !== "owner") {
      throw new Error("Only the company owner can invite members");
    }
    const now = Date.now();
    return await ctx.db.insert("companyMembers", {
      company_id,
      email: email.toLowerCase(),
      role: "member",
      status: "pending",
      invited_by: userId,
      created_at: now,
      updated_at: now,
    });
  },
});

export const removeMember = mutation({
  args: { member_id: v.id("companyMembers") },
  handler: async (ctx, { member_id }) => {
    const userId = await requireAuth(ctx);
    const member = await ctx.db.get(member_id);
    if (!member) throw new Error("Member not found");
    if (member.role === "owner") throw new Error("Cannot remove the company owner");
    const callerMembership = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .first();
    if (!callerMembership || callerMembership.role !== "owner") {
      throw new Error("Only the company owner can remove members");
    }
    await ctx.db.delete(member_id);
  },
});
