import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

async function requireAdmin(ctx: { db: any }, token: string) {
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q: any) => q.eq("session_token", token))
    .unique();
  if (!session || session.expires_at < Date.now()) {
    throw new Error("Invalid or expired admin session");
  }
  return session;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const login = action({
  args: { password: v.string() },
  handler: async (ctx, { password }) => {
    const expectedHash = process.env.ADMIN_PASSWORD_HASH;
    if (!expectedHash) throw new Error("Admin password not configured");

    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (hashHex !== expectedHash) {
      throw new Error("Invalid password");
    }

    const token = crypto.randomUUID();
    const now = Date.now();
    await ctx.runMutation(internal.admin.createSession, {
      session_token: token,
      expires_at: now + 8 * 60 * 60 * 1000, // 8 hours
      created_at: now,
    });

    return { session_token: token, expires_at: now + 8 * 60 * 60 * 1000 };
  },
});

export const createSession = mutation({
  args: {
    session_token: v.string(),
    expires_at: v.number(),
    created_at: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("adminSessions", args);
  },
});

export const checkSession = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("session_token", token))
      .unique();
    return !!session && session.expires_at > Date.now();
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("session_token", token))
      .unique();
    if (session) await ctx.db.delete(session._id);
  },
});

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

export const getPendingClaims = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const claims = await ctx.db
      .query("claimRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const enriched = await Promise.all(
      claims.map(async (c) => {
        const company = await ctx.db.get(c.company_id);
        return { ...c, company };
      })
    );
    return enriched;
  },
});

export const approveClaim = mutation({
  args: { token: v.string(), claim_id: v.id("claimRequests") },
  handler: async (ctx, { token, claim_id }) => {
    await requireAdmin(ctx, token);
    const claim = await ctx.db.get(claim_id);
    if (!claim) throw new Error("Claim not found");

    const now = Date.now();
    await ctx.db.patch(claim_id, { status: "approved", reviewed_at: now });
    await ctx.db.patch(claim.company_id, {
      claim_status: "claimed",
      claimed_by_user_id: claim.claimant_user_id,
      claimed_at: now,
      updated_at: now,
    });

    // Create owner membership
    await ctx.db.insert("companyMembers", {
      company_id: claim.company_id,
      user_id: claim.claimant_user_id,
      email: claim.claimant_email,
      role: "owner",
      status: "active",
      created_at: now,
      updated_at: now,
    });
  },
});

export const rejectClaim = mutation({
  args: { token: v.string(), claim_id: v.id("claimRequests"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, claim_id, notes }) => {
    await requireAdmin(ctx, token);
    const claim = await ctx.db.get(claim_id);
    if (!claim) throw new Error("Claim not found");

    await ctx.db.patch(claim_id, { status: "rejected", admin_notes: notes, reviewed_at: Date.now() });
    await ctx.db.patch(claim.company_id, { claim_status: "unclaimed", updated_at: Date.now() });
  },
});

// ---------------------------------------------------------------------------
// Agent Submissions
// ---------------------------------------------------------------------------

export const getPendingAgents = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.db
      .query("agentSubmissions")
      .withIndex("by_status", (q) => q.eq("submission_status", "pending"))
      .collect();
  },
});

export const approveAgent = mutation({
  args: { token: v.string(), submission_id: v.id("agentSubmissions") },
  handler: async (ctx, { token, submission_id }) => {
    await requireAdmin(ctx, token);
    const sub = await ctx.db.get(submission_id);
    if (!sub) throw new Error("Submission not found");

    const now = Date.now();
    const slug = sub.agent_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const searchText = [sub.agent_name, sub.description, sub.tagline ?? ""].join(" ");

    await ctx.db.insert("agents", {
      slug,
      agent_name: sub.agent_name,
      tagline: sub.tagline,
      description: sub.description,
      category: sub.category,
      company_id: sub.company_id,
      logo_url: sub.logo_url,
      tags: sub.tags,
      use_cases: sub.use_cases,
      industries: sub.industries,
      functional_categories: sub.functional_categories,
      industry_categories: sub.industry_categories,
      infrastructure_categories: sub.infrastructure_categories,
      business_functions: sub.business_functions,
      expected_outcomes: sub.expected_outcomes,
      integrations: sub.integrations,
      supported_platforms: sub.supported_platforms,
      impact_metrics: sub.impact_metrics,
      demo_url: sub.demo_url,
      compliance_certifications: sub.compliance_certifications,
      security_features: sub.security_features,
      rating: 0,
      review_count: 0,
      status: "active",
      search_text: searchText,
      created_at: now,
      updated_at: now,
    });

    await ctx.db.patch(submission_id, { submission_status: "approved", updated_at: now });
  },
});

export const rejectAgent = mutation({
  args: { token: v.string(), submission_id: v.id("agentSubmissions"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, submission_id, notes }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(submission_id, {
      submission_status: "rejected",
      admin_notes: notes,
      updated_at: Date.now(),
    });
  },
});

export const requestChangesAgent = mutation({
  args: { token: v.string(), submission_id: v.id("agentSubmissions"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, submission_id, notes }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(submission_id, {
      submission_status: "changes_requested",
      admin_notes: notes,
      updated_at: Date.now(),
    });
  },
});

// ---------------------------------------------------------------------------
// Company Edits
// ---------------------------------------------------------------------------

export const getPendingCompanyEdits = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const edits = await ctx.db
      .query("companyEdits")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const enriched = await Promise.all(
      edits.map(async (e) => {
        const company = await ctx.db.get(e.company_id);
        return { ...e, company };
      })
    );
    return enriched;
  },
});

export const approveCompanyEdit = mutation({
  args: { token: v.string(), edit_id: v.id("companyEdits") },
  handler: async (ctx, { token, edit_id }) => {
    await requireAdmin(ctx, token);
    const edit = await ctx.db.get(edit_id);
    if (!edit) throw new Error("Edit not found");

    await ctx.db.patch(edit.company_id, {
      ...(edit.payload as Record<string, unknown>),
      updated_at: Date.now(),
    });
    await ctx.db.patch(edit_id, { status: "approved", reviewed_at: Date.now() });
  },
});

export const rejectCompanyEdit = mutation({
  args: { token: v.string(), edit_id: v.id("companyEdits"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, edit_id, notes }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(edit_id, { status: "rejected", admin_notes: notes, reviewed_at: Date.now() });
  },
});

// ---------------------------------------------------------------------------
// Agent Edits
// ---------------------------------------------------------------------------

export const getPendingAgentEdits = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.db
      .query("agentEdits")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const approveAgentEdit = mutation({
  args: { token: v.string(), edit_id: v.id("agentEdits") },
  handler: async (ctx, { token, edit_id }) => {
    await requireAdmin(ctx, token);
    const edit = await ctx.db.get(edit_id);
    if (!edit) throw new Error("Edit not found");

    await ctx.db.patch(edit.agent_id, {
      ...(edit.payload as Record<string, unknown>),
      updated_at: Date.now(),
    });
    await ctx.db.patch(edit_id, { status: "approved" });
  },
});

export const rejectAgentEdit = mutation({
  args: { token: v.string(), edit_id: v.id("agentEdits"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, edit_id, notes }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(edit_id, { status: "rejected", admin_notes: notes });
  },
});

// ---------------------------------------------------------------------------
// Contact Requests
// ---------------------------------------------------------------------------

export const getPendingContactRequests = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.db
      .query("providerRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending_admin"))
      .collect();
  },
});

export const approveContactRequest = mutation({
  args: { token: v.string(), request_id: v.id("providerRequests") },
  handler: async (ctx, { token, request_id }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(request_id, { status: "approved", reviewed_at: Date.now() });
  },
});

export const rejectContactRequest = mutation({
  args: { token: v.string(), request_id: v.id("providerRequests"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, request_id, notes }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(request_id, { status: "rejected", admin_notes: notes, reviewed_at: Date.now() });
  },
});

// ---------------------------------------------------------------------------
// Problems
// ---------------------------------------------------------------------------

export const getPendingProblems = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.db
      .query("problemStatements")
      .withIndex("by_status", (q) => q.eq("status", "pending_review"))
      .collect();
  },
});

export const approveProblem = mutation({
  args: { token: v.string(), problem_id: v.id("problemStatements") },
  handler: async (ctx, { token, problem_id }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(problem_id, { status: "approved" });
  },
});

export const rejectProblem = mutation({
  args: { token: v.string(), problem_id: v.id("problemStatements"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, problem_id, notes }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(problem_id, { status: "rejected", rejection_reason: notes });
  },
});

export const getProblemInterests = query({
  args: { token: v.string(), problem_id: v.id("problemStatements") },
  handler: async (ctx, { token, problem_id }) => {
    await requireAdmin(ctx, token);
    return await ctx.db
      .query("problemStatementInterests")
      .withIndex("by_problemId", (q) => q.eq("problem_statement_id", problem_id))
      .collect();
  },
});

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export const getDirectoryStats = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const agents = await ctx.db.query("agents").collect();
    const companies = await ctx.db.query("companies").collect();
    const gccProfiles = await ctx.db.query("gccProfiles").collect();
    const pendingClaims = await ctx.db
      .query("claimRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const claimed = companies.filter((c) => c.claim_status === "claimed").length;

    return {
      totalAgents: agents.filter((a) => a.status === "active").length,
      totalCompanies: companies.length,
      claimedPercentage: companies.length > 0 ? Math.round((claimed / companies.length) * 100) : 0,
      pendingClaims: pendingClaims.length,
      totalGCCs: gccProfiles.length,
    };
  },
});
