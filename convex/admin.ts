import { query, mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Resend } from "resend";
import { claimApprovedEmail } from "./emails/claimApproved";
import {
  gccReachoutApprovedEmail,
  gccReachoutRejectedEmail,
  providerLeadApprovedEmail,
} from "./emails/contactRequest";
import {
  createCompanyOwnerNotifications,
  createUserNotification,
} from "./notifications";
import { upsertProviderProfile } from "./providerProfiles";
import {
  buildAgentSearchText,
  getAgentValidationErrors,
  normalizeAgentEditPayload,
  normalizeAndValidateCompleteAgent,
} from "./lib/agentTaxonomy";
import { appError } from "./lib/errors";

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

async function requireAdmin(ctx: { db: any }, token: string) {
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q: any) => q.eq("session_token", token))
    .unique();
  if (!session || session.expires_at < Date.now()) {
    appError("admin_session_invalid", "Invalid or expired admin session", 401);
  }
  return session;
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://orbys360.com"
  );
}

async function sendEmailIfConfigured({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return;
  }

  const resend = new Resend(resendApiKey);
  const recipients = Array.isArray(to) ? to : [to];

  for (const recipient of recipients) {
    if (!recipient?.trim()) continue;
    await resend.emails.send({
      from: "Orbys360 <noreply@orbys360.com>",
      to: recipient,
      subject,
      html,
    });
  }
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

async function enrichCompanySubmission(ctx: { db: any }, submission: any) {
  const createdCompany = submission.created_company_id
    ? await ctx.db.get(submission.created_company_id)
    : null;
  const initialAgentSubmission = submission.initial_agent_submission_id
    ? await ctx.db.get(submission.initial_agent_submission_id)
    : null;

  return {
    ...submission,
    createdCompany,
    initialAgentSubmission,
    initialAgentValidationErrors: submission.initial_agent
      ? getAgentValidationErrors(submission.initial_agent)
      : [],
  };
}

async function enrichAgentSubmission(ctx: { db: any }, submission: any) {
  const company = submission.company_id ? await ctx.db.get(submission.company_id) : null;
  return {
    ...submission,
    company,
    validation_errors: getAgentValidationErrors(submission),
  };
}

async function enrichAgentRecord(ctx: { db: any }, agent: any) {
  const company = agent.company_id ? await ctx.db.get(agent.company_id) : null;
  return {
    ...agent,
    company,
  };
}

async function enrichContactRequest(ctx: { db: any }, request: any) {
  const agent = await ctx.db.get(request.agent_id);
  const company = request.company_id ? await ctx.db.get(request.company_id) : null;
  return {
    ...request,
    agent,
    company,
  };
}

function buildReviewBody(defaultMessage: string, notes?: string) {
  const trimmedNotes = notes?.trim();
  return trimmedNotes && trimmedNotes.length > 0 ? trimmedNotes : defaultMessage;
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
      appError("admin_password_invalid", "Invalid password", 401);
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
    if (!claim) appError("admin_claim_not_found", "Claim not found", 404);

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
    if (!isValid) appError("admin_session_invalid", "Invalid or expired admin session", 401);

    // Get claim data
    const claim = await ctx.runQuery(internal.admin._getClaimById, { claim_id });
    if (!claim) appError("admin_claim_not_found", "Claim not found", 404);
    if (claim.status !== "pending") appError("admin_claim_state_invalid", "Claim is not pending", 400);

    // Get company data for the email
    const company = await ctx.runQuery(internal.admin._getCompanyById, { company_id: claim.company_id });
    if (!company) appError("admin_company_not_found", "Company not found", 404);

    // Generate magic link token
    const magicLinkToken = crypto.randomUUID();
    const magicLinkExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const baseUrl = getBaseUrl();
    const magicLinkUrl = `${baseUrl}/claim/activate?token=${magicLinkToken}`;

    // Update claim in DB
    await ctx.runMutation(internal.admin._approveClaimInternal, {
      claim_id,
      magic_link_token: magicLinkToken,
      magic_link_expires_at: magicLinkExpiresAt,
    });

    // Send email via Resend
    const email = claimApprovedEmail({
      claimantName: claim.claimant_name,
      companyName: company.name,
      magicLinkUrl,
    });
    await sendEmailIfConfigured({
      to: claim.claimant_email,
      subject: email.subject,
      html: email.html,
    });

    if (claim.claimant_user_id) {
      await ctx.runMutation(internal.notifications.createUserNotificationInternal, {
        recipient_user_id: claim.claimant_user_id,
        audience_role: "provider",
        type: "provider.claim.approved",
        title: "Claim request approved",
        body: `Your claim for ${company.name} was approved. Finish setup to access your provider workspace.`,
        link: "/provider/setup",
        entity_type: "claimRequest",
        entity_id: claim._id,
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
    if (!claim) appError("admin_claim_not_found", "Claim not found", 404);
    const company = await ctx.db.get(claim.company_id);

    await ctx.db.patch(claim_id, { status: "rejected", admin_notes: notes, reviewed_at: Date.now() });
    await ctx.db.patch(claim.company_id, { claim_status: "unclaimed", updated_at: Date.now() });

    const title = "Claim request rejected";
    const body = buildReviewBody(
      `Your claim for ${company?.name ?? "your company"} was not approved.`,
      notes
    );

    if (claim.claimant_user_id) {
      await createUserNotification(ctx, {
        recipientUserId: claim.claimant_user_id,
        audienceRole: "provider",
        type: "provider.claim.rejected",
        title,
        body,
        link: "/provider/setup",
        entityType: "claimRequest",
        entityId: claim._id,
        shouldEmail: true,
        recipientEmail: claim.claimant_email,
      });
    } else if (claim.claimant_email) {
      await ctx.scheduler.runAfter(0, internal.notifications.sendNotificationEmail, {
        recipient_email: claim.claimant_email,
        title,
        body,
        link: "/provider/setup",
        cta_label: "View update",
      });
    }
  },
});

// ---------------------------------------------------------------------------
// New Company Submissions
// ---------------------------------------------------------------------------

export const getPendingCompanySubmissions = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const submissions = await ctx.db
      .query("companySubmissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return await Promise.all(submissions.map((submission) => enrichCompanySubmission(ctx, submission)));
  },
});

export const approveCompanySubmission = mutation({
  args: { token: v.string(), submission_id: v.id("companySubmissions") },
  handler: async (ctx, { token, submission_id }) => {
    await requireAdmin(ctx, token);

    const submission = await ctx.db.get(submission_id);
    if (!submission) appError("admin_company_submission_not_found", "Submission not found", 404);
    if (submission.status !== "pending") appError("admin_company_submission_state_invalid", "Submission is not pending", 400);

    const existingMembership = await ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", submission.user_id))
      .first();

    if (existingMembership?.status === "active") {
      appError("admin_company_submission_membership_exists", "This user already has an active company membership.", 409);
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

    const initialAgentSubmissionId = submission.initial_agent
      ? await ctx.db.insert("agentSubmissions", {
          ...normalizeAndValidateCompleteAgent(submission.initial_agent),
          company_id: companyId,
          user_id: submission.user_id,
          submission_status: "pending",
          created_at: now,
          updated_at: now,
        })
      : undefined;

    await ctx.db.patch(submission_id, {
      status: "approved",
      reviewed_at: now,
      created_company_id: companyId,
      initial_agent_submission_id: initialAgentSubmissionId,
      updated_at: now,
    });

    await createUserNotification(ctx, {
      recipientUserId: submission.user_id,
      audienceRole: "provider",
      type: "provider.company_submission.approved",
      title: "Company submission approved",
      body: `${submission.company_name} is approved and your provider setup is ready to continue.`,
      link: "/provider/setup",
      entityType: "companySubmission",
      entityId: submission._id,
      shouldEmail: true,
      recipientEmail: submission.contact_email,
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
    const submission = await ctx.db.get(submission_id);
    if (!submission) appError("admin_company_submission_not_found", "Submission not found", 404);

    await ctx.db.patch(submission_id, {
      status: "rejected",
      admin_notes: notes,
      reviewed_at: Date.now(),
      updated_at: Date.now(),
    });

    await createUserNotification(ctx, {
      recipientUserId: submission.user_id,
      audienceRole: "provider",
      type: "provider.company_submission.rejected",
      title: "Company submission rejected",
      body: buildReviewBody(
        `${submission.company_name} was not approved. Review the feedback and submit an updated version.`,
        notes
      ),
      link: "/provider/setup",
      entityType: "companySubmission",
      entityId: submission._id,
      shouldEmail: true,
      recipientEmail: submission.contact_email,
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
    const submissions = await ctx.db
      .query("agentSubmissions")
      .withIndex("by_status", (q) => q.eq("submission_status", "pending"))
      .collect();
    const enriched = await Promise.all(
      submissions.map((submission) => enrichAgentSubmission(ctx, submission))
    );
    return enriched.sort((left, right) => right.created_at - left.created_at);
  },
});

export const approveAgent = mutation({
  args: { token: v.string(), submission_id: v.id("agentSubmissions") },
  handler: async (ctx, { token, submission_id }) => {
    await requireAdmin(ctx, token);
    const sub = await ctx.db.get(submission_id);
    if (!sub) appError("admin_agent_submission_not_found", "Submission not found", 404);

    const now = Date.now();
    const slug = sub.agent_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const normalized = normalizeAndValidateCompleteAgent(sub);
    const searchText = buildAgentSearchText({
      agent_name: normalized.agent_name,
      description: normalized.description,
      tagline: normalized.tagline,
      category: normalized.category,
      functional_categories: normalized.functional_categories,
      industry_categories: normalized.industry_categories,
      integrations: normalized.integrations,
      expected_outcomes: normalized.expected_outcomes,
    });

    await ctx.db.insert("agents", {
      slug,
      agent_name: normalized.agent_name,
      tagline: normalized.tagline,
      description: normalized.description,
      category: normalized.category,
      company_id: sub.company_id,
      logo_url: sub.logo_url,
      use_cases: normalized.use_cases,
      functional_categories: normalized.functional_categories,
      industry_categories: normalized.industry_categories,
      industries: normalized.industries,
      infrastructure_categories: normalized.infrastructure_categories,
      expected_outcomes: normalized.expected_outcomes,
      integrations: normalized.integrations,
      demo_url: normalized.demo_url,
      source_url: normalized.source_url,
      // Carry over optional fields only if they exist on the submission
      ...(sub.tags ? { tags: sub.tags } : {}),
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

    if (sub.company_id) {
      await createCompanyOwnerNotifications(ctx, {
        audienceRole: "provider",
        type: "provider.agent_submission.approved",
        title: "Agent submission approved",
        body: `${normalized.agent_name} is now live in the Orbys360 directory.`,
        link: "/dashboard?tab=agents",
        entityType: "agentSubmission",
        entityId: sub._id,
        companyId: sub.company_id,
        submitterUserId: sub.user_id,
        shouldEmail: true,
      });
    } else {
      await createUserNotification(ctx, {
        recipientUserId: sub.user_id,
        audienceRole: "provider",
        type: "provider.agent_submission.approved",
        title: "Agent submission approved",
        body: `${normalized.agent_name} is now live in the Orbys360 directory.`,
        link: "/dashboard?tab=agents",
        entityType: "agentSubmission",
        entityId: sub._id,
      });
    }
  },
});

export const rejectAgent = mutation({
  args: { token: v.string(), submission_id: v.id("agentSubmissions"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, submission_id, notes }) => {
    await requireAdmin(ctx, token);
    const submission = await ctx.db.get(submission_id);
    if (!submission) appError("admin_agent_submission_not_found", "Submission not found", 404);
    const now = Date.now();
    await ctx.db.patch(submission_id, {
      submission_status: "rejected",
      admin_notes: notes,
      reviewed_at: now,
      updated_at: now,
    });

    const title = "Agent submission rejected";
    const body = buildReviewBody(
      `${submission.agent_name} was not approved.`,
      notes
    );

    if (submission.company_id) {
      await createCompanyOwnerNotifications(ctx, {
        audienceRole: "provider",
        type: "provider.agent_submission.rejected",
        title,
        body,
        link: "/dashboard?tab=agents",
        entityType: "agentSubmission",
        entityId: submission._id,
        companyId: submission.company_id,
        submitterUserId: submission.user_id,
        shouldEmail: true,
      });
    } else {
      await createUserNotification(ctx, {
        recipientUserId: submission.user_id,
        audienceRole: "provider",
        type: "provider.agent_submission.rejected",
        title,
        body,
        link: "/dashboard?tab=agents",
        entityType: "agentSubmission",
        entityId: submission._id,
      });
    }
  },
});

export const requestChangesAgent = mutation({
  args: { token: v.string(), submission_id: v.id("agentSubmissions"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, submission_id, notes }) => {
    await requireAdmin(ctx, token);
    const submission = await ctx.db.get(submission_id);
    if (!submission) appError("admin_agent_submission_not_found", "Submission not found", 404);
    const now = Date.now();
    await ctx.db.patch(submission_id, {
      submission_status: "changes_requested",
      admin_notes: notes,
      reviewed_at: now,
      updated_at: now,
    });

    const title = "Changes requested for agent submission";
    const body = buildReviewBody(
      `Admin requested updates to ${submission.agent_name}.`,
      notes
    );

    if (submission.company_id) {
      await createCompanyOwnerNotifications(ctx, {
        audienceRole: "provider",
        type: "provider.agent_submission.changes_requested",
        title,
        body,
        link: "/dashboard?tab=agents",
        entityType: "agentSubmission",
        entityId: submission._id,
        companyId: submission.company_id,
        submitterUserId: submission.user_id,
        shouldEmail: true,
      });
    } else {
      await createUserNotification(ctx, {
        recipientUserId: submission.user_id,
        audienceRole: "provider",
        type: "provider.agent_submission.changes_requested",
        title,
        body,
        link: "/dashboard?tab=agents",
        entityType: "agentSubmission",
        entityId: submission._id,
      });
    }
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
    if (!edit) appError("admin_company_edit_not_found", "Edit not found", 404);
    const company = await ctx.db.get(edit.company_id);

    await ctx.db.patch(edit.company_id, {
      ...(edit.payload as Record<string, unknown>),
      updated_at: Date.now(),
    });
    await ctx.db.patch(edit_id, { status: "approved", reviewed_at: Date.now() });

    await createCompanyOwnerNotifications(ctx, {
      audienceRole: "provider",
      type: "provider.company_edit.approved",
      title: "Company profile update approved",
      body: `Changes to ${company?.name ?? "your company profile"} are now live.`,
      link: "/dashboard?tab=profile",
      entityType: "companyEdit",
      entityId: edit._id,
      companyId: edit.company_id,
      submitterUserId: edit.user_id,
      shouldEmail: true,
    });
  },
});

export const rejectCompanyEdit = mutation({
  args: { token: v.string(), edit_id: v.id("companyEdits"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, edit_id, notes }) => {
    await requireAdmin(ctx, token);
    const edit = await ctx.db.get(edit_id);
    if (!edit) appError("admin_company_edit_not_found", "Edit not found", 404);
    const company = await ctx.db.get(edit.company_id);
    await ctx.db.patch(edit_id, { status: "rejected", admin_notes: notes, reviewed_at: Date.now() });

    await createCompanyOwnerNotifications(ctx, {
      audienceRole: "provider",
      type: "provider.company_edit.rejected",
      title: "Company profile update rejected",
      body: buildReviewBody(
        `Changes to ${company?.name ?? "your company profile"} were not approved.`,
        notes
      ),
      link: "/dashboard?tab=profile",
      entityType: "companyEdit",
      entityId: edit._id,
      companyId: edit.company_id,
      submitterUserId: edit.user_id,
      shouldEmail: true,
    });
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
    if (!edit) appError("admin_agent_edit_not_found", "Edit not found", 404);
    const agent = await ctx.db.get(edit.agent_id);
    if (!agent) appError("admin_agent_not_found", "Agent not found", 404);

    const payload =
      edit.payload && typeof edit.payload === "object" && !Array.isArray(edit.payload)
        ? { ...(edit.payload as Record<string, unknown>) }
        : {};

    const normalizedPayload = normalizeAgentEditPayload(payload);
    const nextAgent = normalizeAndValidateCompleteAgent({
      ...agent,
      ...normalizedPayload,
    });

    await ctx.db.patch(edit.agent_id, {
      ...normalizedPayload,
      agent_name: nextAgent.agent_name,
      tagline: nextAgent.tagline,
      description: nextAgent.description,
      category: nextAgent.category,
      use_cases: nextAgent.use_cases,
      functional_categories: nextAgent.functional_categories,
      industry_categories: nextAgent.industry_categories,
      industries: nextAgent.industries,
      infrastructure_categories: nextAgent.infrastructure_categories,
      integrations: nextAgent.integrations,
      expected_outcomes: nextAgent.expected_outcomes,
      source_url: nextAgent.source_url,
      demo_url: nextAgent.demo_url,
      search_text: buildAgentSearchText({
        agent_name: nextAgent.agent_name,
        description: nextAgent.description,
        tagline: nextAgent.tagline,
        category: nextAgent.category,
        functional_categories: nextAgent.functional_categories,
        industry_categories: nextAgent.industry_categories,
        integrations: nextAgent.integrations,
        expected_outcomes: nextAgent.expected_outcomes,
      }),
      updated_at: Date.now(),
    });
    await ctx.db.patch(edit_id, { status: "approved", reviewed_at: Date.now() });

    if (agent.company_id) {
      await createCompanyOwnerNotifications(ctx, {
        audienceRole: "provider",
        type: "provider.agent_edit.approved",
        title: "Agent update approved",
        body: `Changes to ${agent.agent_name} are now live.`,
        link: "/dashboard?tab=agents",
        entityType: "agentEdit",
        entityId: edit._id,
        companyId: agent.company_id,
        submitterUserId: edit.user_id,
        shouldEmail: true,
      });
    } else {
      await createUserNotification(ctx, {
        recipientUserId: edit.user_id,
        audienceRole: "provider",
        type: "provider.agent_edit.approved",
        title: "Agent update approved",
        body: `Changes to ${agent.agent_name} are now live.`,
        link: "/dashboard?tab=agents",
        entityType: "agentEdit",
        entityId: edit._id,
      });
    }
  },
});

export const getAllAgentsCatalog = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const agents = await ctx.db.query("agents").collect();
    const enriched = await Promise.all(
      agents.map((agent) => enrichAgentRecord(ctx, agent))
    );
    return enriched.sort((left, right) => right.updated_at - left.updated_at);
  },
});

export const rejectAgentEdit = mutation({
  args: { token: v.string(), edit_id: v.id("agentEdits"), notes: v.optional(v.string()) },
  handler: async (ctx, { token, edit_id, notes }) => {
    await requireAdmin(ctx, token);
    const edit = await ctx.db.get(edit_id);
    if (!edit) appError("admin_agent_edit_not_found", "Edit not found", 404);
    const agent = await ctx.db.get(edit.agent_id);
    if (!agent) appError("admin_agent_not_found", "Agent not found", 404);
    await ctx.db.patch(edit_id, { status: "rejected", admin_notes: notes, reviewed_at: Date.now() });

    const title = "Agent update rejected";
    const body = buildReviewBody(
      `Changes to ${agent.agent_name} were not approved.`,
      notes
    );

    if (agent.company_id) {
      await createCompanyOwnerNotifications(ctx, {
        audienceRole: "provider",
        type: "provider.agent_edit.rejected",
        title,
        body,
        link: "/dashboard?tab=agents",
        entityType: "agentEdit",
        entityId: edit._id,
        companyId: agent.company_id,
        submitterUserId: edit.user_id,
        shouldEmail: true,
      });
    } else {
      await createUserNotification(ctx, {
        recipientUserId: edit.user_id,
        audienceRole: "provider",
        type: "provider.agent_edit.rejected",
        title,
        body,
        link: "/dashboard?tab=agents",
        entityType: "agentEdit",
        entityId: edit._id,
      });
    }
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
    const enriched = await Promise.all(requests.map((request) => enrichContactRequest(ctx, request)));
    return enriched;
  },
});

export const _getContactRequestDetails = internalQuery({
  args: { request_id: v.id("providerRequests") },
  handler: async (ctx, { request_id }) => {
    const request = await ctx.db.get(request_id);
    if (!request) {
      return null;
    }

    const agent = await ctx.db.get(request.agent_id);
    const company = request.company_id ? await ctx.db.get(request.company_id) : null;
    const members = request.company_id
      ? await ctx.db
          .query("companyMembers")
          .withIndex("by_companyId", (q) => q.eq("company_id", request.company_id!))
          .collect()
      : [];

    return {
      request,
      agent,
      company,
      activeMembers: members.filter((member) => member.status === "active"),
    };
  },
});

export const _approveContactRequestInternal = internalMutation({
  args: { request_id: v.id("providerRequests") },
  handler: async (ctx, { request_id }) => {
    const request = await ctx.db.get(request_id);
    if (!request) {
      appError("admin_contact_request_not_found", "Contact request not found", 404);
    }
    if (request.status !== "pending_admin") {
      appError(
        "admin_contact_request_state_invalid",
        "Contact request is not pending admin review.",
        400
      );
    }

    await ctx.db.patch(request_id, {
      status: "approved",
      reviewed_at: Date.now(),
    });
  },
});

export const _rejectContactRequestInternal = internalMutation({
  args: {
    request_id: v.id("providerRequests"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { request_id, notes }) => {
    const request = await ctx.db.get(request_id);
    if (!request) {
      appError("admin_contact_request_not_found", "Contact request not found", 404);
    }
    if (request.status !== "pending_admin") {
      appError(
        "admin_contact_request_state_invalid",
        "Contact request is not pending admin review.",
        400
      );
    }

    await ctx.db.patch(request_id, {
      status: "rejected",
      admin_notes: notes,
      reviewed_at: Date.now(),
    });
  },
});

export const approveContactRequest = action({
  args: { token: v.string(), request_id: v.id("providerRequests") },
  handler: async (ctx, { token, request_id }) => {
    const isValid = await ctx.runQuery(api.admin.checkSession, { token });
    if (!isValid) {
      appError("admin_session_invalid", "Invalid or expired admin session", 401);
    }

    const details = await ctx.runQuery(internal.admin._getContactRequestDetails, {
      request_id,
    });
    if (!details) {
      appError("admin_contact_request_not_found", "Contact request not found", 404);
    }

    await ctx.runMutation(internal.admin._approveContactRequestInternal, {
      request_id,
    });

    const gccDashboardLink = "/gcc-dashboard?tab=current-requests";
    const providerDashboardLink = "/dashboard";
    const gccNotificationBody = `Your request for ${details.agent?.agent_name ?? "this provider"} was approved. The provider team can now review your details and reach out directly.`;

    await ctx.runMutation(internal.notifications.createUserNotificationInternal, {
      recipient_user_id: details.request.gcc_user_id,
      audience_role: "gcc",
      type: "gcc.contact_request.approved",
      title: "Contact request approved",
      body: gccNotificationBody,
      link: gccDashboardLink,
      entity_type: "providerRequest",
      entity_id: details.request._id,
    });

    const providerRecipients = Array.from(
      new Set(
        details.activeMembers
          .map((member) => member.email?.trim().toLowerCase())
          .filter(Boolean)
      )
    ) as string[];

    const providerEmail = providerLeadApprovedEmail({
      agentName: details.agent?.agent_name ?? "Selected solution",
      companyName: details.company?.name ?? "Provider",
      gccName: details.request.gcc_name ?? "Unknown GCC",
      gccEmail: details.request.gcc_email ?? details.request.gcc_user_email ?? "",
      gccOrganization: details.request.gcc_organization ?? "Unknown organization",
      gccIndustry: details.request.gcc_industry ?? "Unknown industry",
      useCase: details.request.use_case ?? "No use case provided",
      currentChallenge:
        details.request.current_challenge ??
        details.request.message ??
        "No challenge provided",
      expectedOutcome:
        details.request.expected_outcome ?? "No expected outcome provided",
      timeline: details.request.timeline ?? "Not specified",
      dashboardUrl: `${getBaseUrl()}${providerDashboardLink}`,
    });

    const gccEmail = gccReachoutApprovedEmail({
      companyName: details.company?.name ?? "the provider",
      agentName: details.agent?.agent_name ?? "your selected solution",
      dashboardUrl: `${getBaseUrl()}${gccDashboardLink}`,
    });

    await Promise.all([
      sendEmailIfConfigured({
        to: providerRecipients,
        subject: providerEmail.subject,
        html: providerEmail.html,
      }),
      sendEmailIfConfigured({
        to: details.request.gcc_email ?? details.request.gcc_user_email ?? "",
        subject: gccEmail.subject,
        html: gccEmail.html,
      }),
    ]);
  },
});

export const rejectContactRequest = action({
  args: {
    token: v.string(),
    request_id: v.id("providerRequests"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { token, request_id, notes }) => {
    const isValid = await ctx.runQuery(api.admin.checkSession, { token });
    if (!isValid) {
      appError("admin_session_invalid", "Invalid or expired admin session", 401);
    }

    const details = await ctx.runQuery(internal.admin._getContactRequestDetails, {
      request_id,
    });
    if (!details) {
      appError("admin_contact_request_not_found", "Contact request not found", 404);
    }

    await ctx.runMutation(internal.admin._rejectContactRequestInternal, {
      request_id,
      notes,
    });

    await ctx.runMutation(internal.notifications.createUserNotificationInternal, {
      recipient_user_id: details.request.gcc_user_id,
      audience_role: "gcc",
      type: "gcc.contact_request.rejected",
      title: "Contact request rejected",
      body: buildReviewBody(
        `Your request for ${details.agent?.agent_name ?? "this provider"} was not approved.`,
        notes
      ),
      link: "/gcc-dashboard?tab=current-requests",
      entity_type: "providerRequest",
      entity_id: details.request._id,
    });

    const gccEmail = gccReachoutRejectedEmail({
      companyName: details.company?.name ?? "the provider",
      agentName: details.agent?.agent_name ?? "your selected solution",
      dashboardUrl: `${getBaseUrl()}/gcc-dashboard?tab=current-requests`,
      adminNotes: notes,
    });

    await sendEmailIfConfigured({
      to: details.request.gcc_email ?? details.request.gcc_user_email ?? "",
      subject: gccEmail.subject,
      html: gccEmail.html,
    });
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
      resolved.map((submission) => enrichAgentSubmission(ctx, submission))
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
      resolved.map((submission) => enrichCompanySubmission(ctx, submission))
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
      resolved.map((request) => enrichContactRequest(ctx, request))
    );
    return enriched
      .sort(
        (a, b) =>
          (b.contacted_at ?? b.reviewed_at ?? b.created_at) -
          (a.contacted_at ?? a.reviewed_at ?? a.created_at)
      )
      .slice(0, 50);
  },
});

// ---------------------------------------------------------------------------
// Unclaim Companies (admin cleanup)
// ---------------------------------------------------------------------------

export const listClaimedCompanies = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const companies = await ctx.db.query("companies").collect();
    return companies
      .filter((c) => c.claim_status !== "unclaimed")
      .map((c) => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        claim_status: c.claim_status,
        claimed_by_user_id: c.claimed_by_user_id ?? null,
        claimed_at: c.claimed_at ?? null,
      }));
  },
});

export const unclaimCompany = mutation({
  args: { token: v.string(), company_id: v.id("companies") },
  handler: async (ctx, { token, company_id }) => {
    await requireAdmin(ctx, token);
    const company = await ctx.db.get(company_id);
    if (!company) appError("admin_company_not_found", "Company not found", 404);

    await ctx.db.patch(company_id, {
      claim_status: "unclaimed",
      claimed_by_user_id: undefined,
      claimed_at: undefined,
      updated_at: Date.now(),
    });

    const claims = await ctx.db
      .query("claimRequests")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
    for (const claim of claims) {
      if (claim.status === "approved" || claim.status === "activated") {
        await ctx.db.patch(claim._id, { status: "rejected", reviewed_at: Date.now() });
      }
    }

    const members = await ctx.db
      .query("companyMembers")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    return { success: true, company: company.name };
  },
});
