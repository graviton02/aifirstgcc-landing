import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export const getMyContactRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return await ctx.db
      .query("providerRequests")
      .withIndex("by_gccUserId", (q) => q.eq("gcc_user_id", userId))
      .collect();
  },
});

export const createContactRequest = mutation({
  args: {
    agent_id: v.id("agents"),
    gcc_user_email: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const agent = await ctx.db.get(args.agent_id);
    if (!agent) throw new Error("Agent not found");

    return await ctx.db.insert("providerRequests", {
      company_id: agent.company_id,
      gcc_user_email: args.gcc_user_email,
      gcc_user_id: userId,
      agent_id: args.agent_id,
      message: args.message,
      status: "pending_admin",
      created_at: Date.now(),
    });
  },
});

export const getMyProblems = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return await ctx.db
      .query("problemStatements")
      .withIndex("by_gccUserId", (q) => q.eq("gcc_user_id", userId))
      .collect();
  },
});

export const getApprovedProblems = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    timeline: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const pageSize = args.limit ?? 20;
    const all = await ctx.db
      .query("problemStatements")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    const filtered = all.filter((p) => {
      if (args.category && p.category !== args.category) return false;
      if (args.timeline && p.timeline !== args.timeline) return false;
      if (args.search) {
        const q = args.search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    return { data: filtered.slice(0, pageSize), count: filtered.length };
  },
});

export const submitProblem = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    industry: v.string(),
    desired_outcome: v.string(),
    timeline: v.union(v.literal("immediate"), v.literal("short"), v.literal("medium"), v.literal("long")),
    budget_range: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    return await ctx.db.insert("problemStatements", {
      ...args,
      gcc_user_id: userId,
      status: "pending_review",
      interest_count: 0,
      created_at: Date.now(),
    });
  },
});

export const expressInterest = mutation({
  args: {
    problem_statement_id: v.id("problemStatements"),
    provider_user_email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query("problemStatementInterests")
      .withIndex("by_problemId", (q) => q.eq("problem_statement_id", args.problem_statement_id))
      .collect();
    if (existing.some((e) => e.provider_user_id === userId)) {
      return { duplicate: true };
    }
    await ctx.db.insert("problemStatementInterests", {
      problem_statement_id: args.problem_statement_id,
      provider_user_id: userId,
      provider_user_email: args.provider_user_email,
      created_at: Date.now(),
    });
    const problem = await ctx.db.get(args.problem_statement_id);
    if (problem) {
      await ctx.db.patch(args.problem_statement_id, {
        interest_count: problem.interest_count + 1,
      });
    }
    return { duplicate: false };
  },
});
