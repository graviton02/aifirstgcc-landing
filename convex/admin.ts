import { query, mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Resend } from "resend";
import { claimApprovedEmail } from "./emails/claimApproved";
import { upsertProviderProfile } from "./providerProfiles";

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

function slugifyCompanyName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "company";
}

async function getUniqueCompanySlug(ctx: { db: any }, companyName: string) {
  const baseSlug = slugifyCompanyName(companyName);
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q: any) => q.eq("slug", candidate))
      .unique();

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
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

export const createSession = internalMutation({
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

// Internal mutation to update claim with magic link data (called by approveClaim action)
export const _approveClaimInternal = internalMutation({
  args: {
    claim_id: v.id("claimRequests"),
    magic_link_token: v.string(),
    magic_link_expires_at: v.number(),
  },
  handler: async (ctx, { claim_id, magic_link_token, magic_link_expires_at }) => {
    const claim = await ctx.db.get(claim_id);
    if (!claim) throw new Error("Claim not found");

    const now = Date.now();
    await ctx.db.patch(claim_id, {
      status: "approved",
      reviewed_at: now,
      magic_link_token,
      magic_link_sent_at: now,
      magic_link_expires_at,
    });
    // Update company status to "approved" (claim approved, awaiting activation)
    await ctx.db.patch(claim.company_id, {
      claim_status: "approved",
      updated_at: Date.now(),
    });
  },
});

export const approveClaim = action({
  args: { token: v.string(), claim_id: v.id("claimRequests") },
  handler: async (ctx, { token, claim_id }) => {
    // Validate admin session
    const isValid = await ctx.runQuery(api.admin.checkSession, { token });
    if (!isValid) throw new Error("Invalid or expired admin session");

    // Get claim data
    const claim = await ctx.runQuery(internal.admin._getClaimById, { claim_id });
    if (!claim) throw new Error("Claim not found");
    if (claim.status !== "pending") throw new Error("Claim is not pending");

    // Get company data for the email
    const company = await ctx.runQuery(internal.admin._getCompanyById, { company_id: claim.company_id });
    if (!company) throw new Error("Company not found");

    // Generate magic link token
    const magicLinkToken = crypto.randomUUID();
    const magicLinkExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://orbys360.com";
    const magicLinkUrl = `${baseUrl}/claim/activate?token=${magicLinkToken}`;

    // Update claim in DB
    await ctx.runMutation(internal.admin._approveClaimInternal, {
      claim_id,
      magic_link_token: magicLinkToken,
      magic_link_expires_at: magicLinkExpiresAt,
    });

    // Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const email = claimApprovedEmail({
        claimantName: claim.claimant_name,
        companyName: company.name,
        magicLinkUrl,
      });
      await resend.emails.send({
        from: "Orbys360 <noreply@orbys360.com>",
        to: claim.claimant_email,
        subject: email.subject,
        html: email.html,
      });
    }
  },
});

// Internal queries used by approveClaim action
export const _getClaimById = internalQuery({
  args: { claim_id: v.id("claimRequests") },
  handler: async (ctx, { claim_id }) => {
    return await ctx.db.get(claim_id);
  },
});

export const _getCompanyById = internalQuery({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    return await ctx.db.get(company_id);
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
// New Company Submissions
// ---------------------------------------------------------------------------

export const getPendingCompanySubmissions = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.db
      .query("companySubmissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const approveCompanySubmission = mutation({
  args: { token: v.string(), submission_id: v.id("companySubmissions") },
  handler: async (ctx, { token, submission_id }) => {
    await requireAdmin(ctx, token);

    const submission = await ctx.db.get(submission_id);
    if (!submission) throw new Error("Submission not found");
    if (submission.status !== "pending") throw new Error("Submission is not pending");

    const existingMembership = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", submission.user_id))
      .first();

    if (existingMembership?.status === "active") {
      throw new Error("This user already has an active company membership.");
    }

    const now = Date.now();
    const slug = await getUniqueCompanySlug(ctx, submission.company_name);

    const companyId = await ctx.db.insert("companies", {
      slug,
      name: submission.company_name,
      description: submission.description,
      website: submission.website,
      headquarters: submission.headquarters,
      company_size: submission.company_size,
      primary_verticals: submission.primary_verticals,
      contact_email: submission.contact_email,
      verification_status: "verified",
      claim_status: "claimed",
      claimed_by_user_id: submission.user_id,
      claimed_at: now,
      created_at: now,
      updated_at: now,
    });

    await ctx.db.insert("companyMembers", {
      company_id: companyId,
      user_id: submission.user_id,
      email: submission.contact_email,
      role: "owner",
      status: "active",
      created_at: now,
      updated_at: now,
    });

    await upsertProviderProfile(ctx, submission.user_id, "create_new");

    await ctx.db.patch(submission_id, {
      status: "approved",
      reviewed_at: now,
      created_company_id: companyId,
      updated_at: now,
    });
  },
});

export const rejectCompanySubmission = mutation({
  args: {
    token: v.string(),
    submission_id: v.id("companySubmissions"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { token, submission_id, notes }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(submission_id, {
      status: "rejected",
      admin_notes: notes,
      reviewed_at: Date.now(),
      updated_at: Date.now(),
    });
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
      use_cases: sub.use_cases,
      functional_categories: sub.functional_categories,
      industry_categories: sub.industry_categories,
      infrastructure_categories: sub.infrastructure_categories,
      business_functions: sub.business_functions,
      expected_outcomes: sub.expected_outcomes,
      integrations: sub.integrations,
      demo_url: sub.demo_url,
      source_url: sub.source_url,
      // Carry over optional fields only if they exist on the submission
      ...(sub.tags ? { tags: sub.tags } : {}),
      ...(sub.industries ? { industries: sub.industries } : {}),
      ...(sub.supported_platforms ? { supported_platforms: sub.supported_platforms } : {}),
      ...(sub.impact_metrics ? { impact_metrics: sub.impact_metrics } : {}),
      ...(sub.compliance_certifications ? { compliance_certifications: sub.compliance_certifications } : {}),
      ...(sub.security_features ? { security_features: sub.security_features } : {}),
      status: "active",
      search_text: searchText,
      created_at: now,
      updated_at: now,
    });

    await ctx.db.patch(submission_id, { submission_status: "approved", reviewed_at: Date.now(), updated_at: now });
  },
});

export const rejectAgent = mutation({
  args: { token: v.string(), submission_id: v.id("agentSubmissions"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, submission_id, notes }) => {
    await requireAdmin(ctx, token);
    const now = Date.now();
    await ctx.db.patch(submission_id, {
      submission_status: "rejected",
      admin_notes: notes,
      reviewed_at: now,
      updated_at: now,
    });
  },
});

export const requestChangesAgent = mutation({
  args: { token: v.string(), submission_id: v.id("agentSubmissions"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, submission_id, notes }) => {
    await requireAdmin(ctx, token);
    const now = Date.now();
    await ctx.db.patch(submission_id, {
      submission_status: "changes_requested",
      admin_notes: notes,
      reviewed_at: now,
      updated_at: now,
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
    const edits = await ctx.db
      .query("agentEdits")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const enriched = await Promise.all(
      edits.map(async (e) => {
        const agent = await ctx.db.get(e.agent_id);
        return { ...e, agent };
      })
    );
    return enriched;
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
    await ctx.db.patch(edit_id, { status: "approved", reviewed_at: Date.now() });
  },
});

export const rejectAgentEdit = mutation({
  args: { token: v.string(), edit_id: v.id("agentEdits"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, edit_id, notes }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(edit_id, { status: "rejected", admin_notes: notes, reviewed_at: Date.now() });
  },
});

// ---------------------------------------------------------------------------
// Contact Requests
// ---------------------------------------------------------------------------

export const getPendingContactRequests = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const requests = await ctx.db
      .query("providerRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending_admin"))
      .collect();
    const enriched = await Promise.all(
      requests.map(async (r) => {
        const agent = await ctx.db.get(r.agent_id);
        const company = r.company_id ? await ctx.db.get(r.company_id) : null;
        return { ...r, agent, company };
      })
    );
    return enriched;
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
    const pendingCompanyEdits = await ctx.db
      .query("companyEdits")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const pendingCompanySubmissions = await ctx.db
      .query("companySubmissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const pendingAgentSubmissions = await ctx.db
      .query("agentSubmissions")
      .withIndex("by_status", (q) => q.eq("submission_status", "pending"))
      .collect();
    const pendingAgentEdits = await ctx.db
      .query("agentEdits")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const pendingContactRequests = await ctx.db
      .query("providerRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending_admin"))
      .collect();

    const claimed = companies.filter((c) => c.claim_status === "claimed").length;

    return {
      totalAgents: agents.filter((a) => a.status === "active").length,
      totalCompanies: companies.length,
      claimedPercentage: companies.length > 0 ? Math.round((claimed / companies.length) * 100) : 0,
      totalGCCs: gccProfiles.length,
      pendingClaims: pendingClaims.length,
      pendingCompanySubmissions: pendingCompanySubmissions.length,
      pendingCompanyEdits: pendingCompanyEdits.length,
      pendingAgentSubmissions: pendingAgentSubmissions.length,
      pendingAgentEdits: pendingAgentEdits.length,
      pendingContactRequests: pendingContactRequests.length,
    };
  },
});

// ---------------------------------------------------------------------------
// History Queries (resolved items, newest first, limit 50)
// ---------------------------------------------------------------------------

export const getClaimsHistory = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const all = await ctx.db.query("claimRequests").collect();
    const resolved = all.filter((c) => c.status !== "pending");
    const enriched = await Promise.all(
      resolved.map(async (c) => {
        const company = await ctx.db.get(c.company_id);
        return { ...c, company };
      })
    );
    return enriched
      .sort((a, b) => (b.reviewed_at ?? b.created_at) - (a.reviewed_at ?? a.created_at))
      .slice(0, 50);
  },
});

export const getAgentSubmissionsHistory = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const all = await ctx.db.query("agentSubmissions").collect();
    const resolved = all.filter((s) => s.submission_status !== "pending");
    const enriched = await Promise.all(
      resolved.map(async (s) => {
        const company = s.company_id ? await ctx.db.get(s.company_id) : null;
        return { ...s, company };
      })
    );
    return enriched
      .sort((a, b) => (b.reviewed_at ?? b.created_at) - (a.reviewed_at ?? a.created_at))
      .slice(0, 50);
  },
});

export const getCompanySubmissionsHistory = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const all = await ctx.db.query("companySubmissions").collect();
    const resolved = all.filter((submission) => submission.status !== "pending");
    const enriched = await Promise.all(
      resolved.map(async (submission) => {
        const createdCompany = submission.created_company_id
          ? await ctx.db.get(submission.created_company_id)
          : null;
        return { ...submission, createdCompany };
      })
    );

    return enriched
      .sort((a, b) => (b.reviewed_at ?? b.created_at) - (a.reviewed_at ?? a.created_at))
      .slice(0, 50);
  },
});

export const getCompanyEditsHistory = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const all = await ctx.db.query("companyEdits").collect();
    const resolved = all.filter((e) => e.status !== "pending");
    const enriched = await Promise.all(
      resolved.map(async (e) => {
        const company = await ctx.db.get(e.company_id);
        return { ...e, company };
      })
    );
    return enriched
      .sort((a, b) => (b.reviewed_at ?? b.created_at) - (a.reviewed_at ?? a.created_at))
      .slice(0, 50);
  },
});

export const getAgentEditsHistory = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const all = await ctx.db.query("agentEdits").collect();
    const resolved = all.filter((e) => e.status !== "pending");
    const enriched = await Promise.all(
      resolved.map(async (e) => {
        const agent = await ctx.db.get(e.agent_id);
        return { ...e, agent };
      })
    );
    return enriched
      .sort((a, b) => (b.reviewed_at ?? b.created_at) - (a.reviewed_at ?? a.created_at))
      .slice(0, 50);
  },
});

export const getContactRequestsHistory = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const all = await ctx.db.query("providerRequests").collect();
    const resolved = all.filter((r) => r.status !== "pending_admin");
    const enriched = await Promise.all(
      resolved.map(async (r) => {
        const agent = await ctx.db.get(r.agent_id);
        const company = r.company_id ? await ctx.db.get(r.company_id) : null;
        return { ...r, agent, company };
      })
    );
    return enriched
      .sort((a, b) => (b.reviewed_at ?? b.created_at) - (a.reviewed_at ?? a.created_at))
      .slice(0, 50);
  },
});
