import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getActiveMembershipForCompany, getActiveMembershipForUser } from "./companyMembers";
import {
  createCompanyMemberNotifications,
  createUserNotification,
} from "./notifications";
import { requireAdmin } from "./lib/admin";
import { requireAuth } from "./lib/auth";
import { appError } from "./lib/errors";
import { withResolvedLogoUrl } from "./lib/companyLogos";
import { syncAgentDirectoryCard } from "./lib/agentDirectoryCards";

type ReviewReaderCtx =
  | Pick<QueryCtx, "db" | "auth" | "storage">
  | Pick<MutationCtx, "db" | "auth" | "storage">;
type ReviewWriterCtx = Pick<MutationCtx, "db" | "auth" | "scheduler" | "storage">;

const ANONYMOUS_REVIEWER_LABEL = "Anonymous GCC Buyer";

const reviewInputArgs = {
  title: v.string(),
  rating_overall: v.number(),
  rating_effectiveness: v.number(),
  rating_value: v.number(),
  pros: v.string(),
  cons: v.string(),
  use_case: v.optional(v.string()),
};

type ReviewInput = {
  title: string;
  rating_overall: number;
  rating_effectiveness: number;
  rating_value: number;
  pros: string;
  cons: string;
  use_case?: string;
};

function clampLimit(limit?: number, fallback = 5, max = 50) {
  return Math.max(1, Math.min(limit ?? fallback, max));
}

function validateRating(value: number, label: string) {
  if (!Number.isFinite(value) || value < 1 || value > 5) {
    appError("review_validation_error", `${label} must be between 1 and 5.`, 400);
  }
  return Math.round(value);
}

function cleanRequiredText(value: string, label: string, minLength: number) {
  const cleaned = value.trim();
  if (cleaned.length < minLength) {
    appError(
      "review_validation_error",
      `${label} must be at least ${minLength} characters.`,
      400
    );
  }
  return cleaned;
}

function cleanOptionalText(value?: string) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

function normalizeReviewInput(input: ReviewInput) {
  return {
    title: cleanRequiredText(input.title, "Title", 5),
    rating_overall: validateRating(input.rating_overall, "Overall rating"),
    rating_effectiveness: validateRating(
      input.rating_effectiveness,
      "Effectiveness rating"
    ),
    rating_value: validateRating(input.rating_value, "Value rating"),
    pros: cleanRequiredText(input.pros, "Pros", 50),
    cons: cleanRequiredText(input.cons, "Cons", 50),
    use_case: cleanOptionalText(input.use_case),
  };
}

function sortByRecent<T extends { reviewed_at?: number; updated_at?: number; created_at: number }>(
  left: T,
  right: T
) {
  return (
    (right.reviewed_at ?? right.updated_at ?? right.created_at) -
    (left.reviewed_at ?? left.updated_at ?? left.created_at)
  );
}

async function getGccProfile(ctx: ReviewReaderCtx, userId: string) {
  return await ctx.db
    .query("gccProfiles")
    .withIndex("by_userId", (q) => q.eq("user_id", userId))
    .unique();
}

async function hasProviderAccessOrProfile(
  ctx: Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">,
  userId: string
) {
  const [membership, providerProfile] = await Promise.all([
    getActiveMembershipForUser(ctx, userId),
    ctx.db
      .query("providerProfiles")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .unique(),
  ]);

  return Boolean(membership || providerProfile);
}

async function getAgentAndCompanyForReview(ctx: ReviewReaderCtx, agentId: Id<"agents">) {
  const agent = await ctx.db.get(agentId);
  if (!agent || agent.status !== "active") {
    appError("review_agent_not_found", "Agent not found.", 404);
  }
  if (!agent.company_id) {
    appError(
      "review_company_missing",
      "This agent doesn't have a provider profile yet.",
      400
    );
  }

  const company = await ctx.db.get(agent.company_id);
  if (!company || company.claim_status !== "claimed") {
    appError(
      "review_listing_unavailable",
      "Reviews are only available for verified provider profiles.",
      400
    );
  }

  return { agent, company };
}

async function getReviewByReviewerAndAgent(
  ctx: Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">,
  reviewerId: string,
  agentId: Id<"agents">
) {
  const matches = await ctx.db
    .query("reviews")
    .withIndex("by_reviewer_agent", (q) =>
      q.eq("reviewer_id", reviewerId).eq("agent_id", agentId)
    )
    .collect();

  return matches.sort(sortByRecent)[0] ?? null;
}

async function getResponseByReviewId(
  ctx: Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">,
  reviewId: Id<"reviews">
) {
  const responses = await ctx.db
    .query("reviewResponses")
    .withIndex("by_review", (q) => q.eq("review_id", reviewId))
    .collect();

  return responses.sort(sortByRecent)[0] ?? null;
}

async function recalculateAgentMetrics(
  ctx: Pick<MutationCtx, "db">,
  agentId: Id<"agents">
) {
  const agent = await ctx.db.get(agentId);
  if (!agent) {
    return;
  }

  const approvedReviews = await ctx.db
    .query("reviews")
    .withIndex("by_agent_status_created", (q) =>
      q.eq("agent_id", agentId).eq("status", "approved")
    )
    .collect();

  if (approvedReviews.length === 0) {
    await ctx.db.patch(agentId, {
      rating: undefined,
      rating_effectiveness: undefined,
      rating_value: undefined,
      review_count: 0,
      updated_at: Date.now(),
    });
    await syncAgentDirectoryCard(ctx as any, agentId);
    return;
  }

  const totals = approvedReviews.reduce(
    (acc, review) => {
      acc.overall += review.rating_overall;
      acc.effectiveness += review.rating_effectiveness;
      acc.value += review.rating_value;
      return acc;
    },
    { overall: 0, effectiveness: 0, value: 0 }
  );

  const count = approvedReviews.length;
  await ctx.db.patch(agentId, {
    rating: Number((totals.overall / count).toFixed(1)),
    rating_effectiveness: Number((totals.effectiveness / count).toFixed(1)),
    rating_value: Number((totals.value / count).toFixed(1)),
    review_count: count,
    updated_at: Date.now(),
  });
  await syncAgentDirectoryCard(ctx as any, agentId);
}

async function getCompanyPublicSummaryById(
  ctx: Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">,
  companyId: Id<"companies">
) {
  const agents = await ctx.db
    .query("agents")
    .withIndex("by_companyId", (q) => q.eq("company_id", companyId))
    .collect();

  const ratedAgents = agents.filter(
    (agent) =>
      agent.status === "active" &&
      (agent.review_count ?? 0) > 0 &&
      typeof agent.rating === "number"
  );

  if (ratedAgents.length === 0) {
    return {
      overallRating: null as number | null,
      reviewCount: 0,
      ratedAgentCount: 0,
    };
  }

  const totalReviewCount = ratedAgents.reduce(
    (sum, agent) => sum + (agent.review_count ?? 0),
    0
  );
  const weightedTotal = ratedAgents.reduce(
    (sum, agent) => sum + (agent.rating ?? 0) * (agent.review_count ?? 0),
    0
  );

  return {
    overallRating:
      totalReviewCount > 0
        ? Number((weightedTotal / totalReviewCount).toFixed(1))
        : null,
    reviewCount: totalReviewCount,
    ratedAgentCount: ratedAgents.length,
  };
}

async function scheduleAdminAlert(ctx: ReviewWriterCtx, type: string) {
  if (process.env.VITEST) {
    return;
  }

  try {
    await ctx.scheduler.runAfter(0, internal.adminNotifications.sendAdminAlert, {
      type,
    });
  } catch {
    // Review writes should still succeed if the scheduler is unavailable.
  }
}

function buildPublicResponse(response: Doc<"reviewResponses">) {
  return {
    _id: response._id,
    body: response.body,
    created_at: response.created_at,
    updated_at: response.updated_at,
  };
}

function buildDashboardResponse(response: Doc<"reviewResponses">) {
  return {
    _id: response._id,
    body: response.body,
    status: response.status,
    moderation_reason: response.moderation_reason,
    created_at: response.created_at,
    updated_at: response.updated_at,
    reviewed_at: response.reviewed_at,
  };
}

async function buildPublicReview(
  ctx: Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">,
  review: Doc<"reviews">
) {
  const approvedResponse = await getResponseByReviewId(ctx, review._id);
  const response =
    approvedResponse && approvedResponse.status === "approved"
      ? buildPublicResponse(approvedResponse)
      : null;

  return {
    _id: review._id,
    reviewer_label: ANONYMOUS_REVIEWER_LABEL,
    rating_overall: review.rating_overall,
    rating_effectiveness: review.rating_effectiveness,
    rating_value: review.rating_value,
    title: review.title,
    pros: review.pros,
    cons: review.cons,
    use_case: review.use_case,
    created_at: review.created_at,
    updated_at: review.updated_at,
    response,
  };
}

async function buildGccReviewRecord(
  ctx: ReviewReaderCtx,
  review: Doc<"reviews">
) {
  const agent = await ctx.db.get(review.agent_id);
  const company = await withResolvedLogoUrl(ctx, await ctx.db.get(review.company_id));
  const response = await getResponseByReviewId(ctx, review._id);

  return {
    _id: review._id,
    provider_request_id: review.provider_request_id,
    agent_id: review.agent_id,
    company_id: review.company_id,
    rating_overall: review.rating_overall,
    rating_effectiveness: review.rating_effectiveness,
    rating_value: review.rating_value,
    title: review.title,
    pros: review.pros,
    cons: review.cons,
    use_case: review.use_case,
    status: review.status,
    moderation_reason: review.moderation_reason,
    created_at: review.created_at,
    updated_at: review.updated_at,
    reviewed_at: review.reviewed_at,
    agent,
    company,
    response: response ? buildDashboardResponse(response) : null,
  };
}

async function buildProviderReviewRecord(
  ctx: ReviewReaderCtx,
  review: Doc<"reviews">
) {
  const agent = await ctx.db.get(review.agent_id);
  const company = await withResolvedLogoUrl(ctx, await ctx.db.get(review.company_id));
  const response = await getResponseByReviewId(ctx, review._id);

  return {
    _id: review._id,
    reviewer_label: ANONYMOUS_REVIEWER_LABEL,
    rating_overall: review.rating_overall,
    rating_effectiveness: review.rating_effectiveness,
    rating_value: review.rating_value,
    title: review.title,
    pros: review.pros,
    cons: review.cons,
    use_case: review.use_case,
    status: review.status,
    moderation_reason: review.moderation_reason,
    created_at: review.created_at,
    updated_at: review.updated_at,
    reviewed_at: review.reviewed_at,
    agent,
    company,
    response: response ? buildDashboardResponse(response) : null,
  };
}

async function buildAdminReviewRecord(
  ctx: ReviewReaderCtx,
  review: Doc<"reviews">
) {
  const agent = await ctx.db.get(review.agent_id);
  const company = await withResolvedLogoUrl(ctx, await ctx.db.get(review.company_id));
  const response = await getResponseByReviewId(ctx, review._id);

  return {
    ...review,
    agent,
    company,
    response: response ? { ...response } : null,
  };
}

function reviewLinkForAgent(agent?: { slug?: string | undefined } | null) {
  return agent?.slug ? `/agents/${agent.slug}#reviews` : "/gcc-dashboard?tab=my-reviews";
}

export const getAgentPublicData = query({
  args: {
    agent_id: v.optional(v.id("agents")),
    slug: v.optional(v.string()),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let agent =
      args.agent_id !== undefined ? await ctx.db.get(args.agent_id) : null;

    if (!agent && args.slug) {
      agent = await ctx.db
        .query("agents")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
        .unique();
    }

    if (!agent || agent.status !== "active") {
      return null;
    }

    const pageSize = clampLimit(args.limit, 5, 20);
    const offset = Math.max(0, args.cursor ?? 0);
    const approvedReviews = await ctx.db
      .query("reviews")
      .withIndex("by_agent_status_created", (q) =>
        q.eq("agent_id", agent._id).eq("status", "approved")
      )
      .order("desc")
      .collect();

    const page = approvedReviews.slice(offset, offset + pageSize);
    const nextCursor =
      offset + page.length < approvedReviews.length ? offset + page.length : null;

    return {
      summary: {
        overallRating: agent.rating ?? null,
        reviewCount: agent.review_count ?? 0,
        effectivenessRating: agent.rating_effectiveness ?? null,
        valueRating: agent.rating_value ?? null,
      },
      reviews: await Promise.all(page.map((review) => buildPublicReview(ctx, review))),
      nextCursor,
    };
  },
});

export const getCompanyPublicSummary = query({
  args: {
    company_id: v.optional(v.id("companies")),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let company =
      args.company_id !== undefined ? await ctx.db.get(args.company_id) : null;

    if (!company && args.slug) {
      company = await ctx.db
        .query("companies")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
        .unique();
    }

    if (!company) {
      return null;
    }

    return await getCompanyPublicSummaryById(ctx, company._id);
  },
});

export const getReviewEligibility = query({
  args: { agent_id: v.id("agents") },
  handler: async (ctx, { agent_id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        canReview: false,
        canCreate: false,
        canEdit: false,
        reason: "sign_in_required",
        existingReview: null,
      };
    }

    const userId = identity.subject;
    if (await hasProviderAccessOrProfile(ctx, userId)) {
      return {
        canReview: false,
        canCreate: false,
        canEdit: false,
        reason: "provider_account_blocked",
        existingReview: null,
      };
    }

    const agent = await ctx.db.get(agent_id);
    if (!agent || agent.status !== "active" || !agent.company_id) {
      return {
        canReview: false,
        canCreate: false,
        canEdit: false,
        reason: "listing_unavailable",
        existingReview: null,
      };
    }

    const company = await ctx.db.get(agent.company_id);
    if (!company || company.claim_status !== "claimed") {
      return {
        canReview: false,
        canCreate: false,
        canEdit: false,
        reason: "listing_unavailable",
        existingReview: null,
      };
    }

    const existingReview = await getReviewByReviewerAndAgent(ctx, userId, agent_id);
    if (existingReview) {
      return {
        canReview: existingReview.status !== "removed",
        canCreate: false,
        canEdit: existingReview.status !== "removed",
        reason:
          existingReview.status === "removed"
            ? "review_removed"
            : "existing_review",
        existingReview: {
          _id: existingReview._id,
          status: existingReview.status,
          title: existingReview.title,
          rating_overall: existingReview.rating_overall,
          rating_effectiveness: existingReview.rating_effectiveness,
          rating_value: existingReview.rating_value,
          pros: existingReview.pros,
          cons: existingReview.cons,
          use_case: existingReview.use_case,
          moderation_reason: existingReview.moderation_reason,
          reviewed_at: existingReview.reviewed_at,
          updated_at: existingReview.updated_at,
        },
      };
    }

    const gccProfile = await getGccProfile(ctx, userId);
    if (!gccProfile) {
      return {
        canReview: false,
        canCreate: false,
        canEdit: false,
        reason: "gcc_profile_required",
        existingReview: null,
      };
    }

    return {
      canReview: true,
      canCreate: true,
      canEdit: false,
      reason: "eligible",
      existingReview: null,
    };
  },
});

export const getMyReviews = query({
  args: { cursor: v.optional(v.number()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const pageSize = clampLimit(args.limit, 20, 50);
    const offset = Math.max(0, args.cursor ?? 0);

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_reviewer", (q) => q.eq("reviewer_id", userId))
      .order("desc")
      .collect();

    const page = reviews.slice(offset, offset + pageSize);
    const nextCursor = offset + page.length < reviews.length ? offset + page.length : null;

    return {
      reviews: await Promise.all(page.map((review) => buildGccReviewRecord(ctx, review))),
      nextCursor,
    };
  },
});

export const getCompanyReviews = query({
  args: {
    agent_id: v.optional(v.id("agents")),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const membership = await getActiveMembershipForUser(ctx, userId);
    if (!membership) {
      appError(
        "provider_membership_required",
        "Only active team members can view and respond to reviews.",
        403
      );
    }

    const pageSize = clampLimit(args.limit, 20, 50);
    const offset = Math.max(0, args.cursor ?? 0);

    const allReviews = await ctx.db.query("reviews").collect();
    const filtered = allReviews
      .filter(
        (review) =>
          review.company_id === membership.company_id &&
          (args.agent_id ? review.agent_id === args.agent_id : true)
      )
      .sort(sortByRecent);

    const page = filtered.slice(offset, offset + pageSize);
    const nextCursor = offset + page.length < filtered.length ? offset + page.length : null;
    const companySummary = await getCompanyPublicSummaryById(ctx, membership.company_id);

    const responses = await ctx.db.query("reviewResponses").collect();
    const responseRateDenominator = filtered.filter((review) => review.status === "approved").length;
    const respondedReviewIds = new Set(
      responses
        .filter((response) => response.company_id === membership.company_id && response.status !== "removed")
        .map((response) => response.review_id)
    );
    const responseRate =
      responseRateDenominator > 0
        ? Math.round((respondedReviewIds.size / responseRateDenominator) * 100)
        : 0;

    return {
      summary: {
        averageRating: companySummary?.overallRating ?? null,
        totalReviews: companySummary?.reviewCount ?? 0,
        responseRate,
      },
      reviews: await Promise.all(page.map((review) => buildProviderReviewRecord(ctx, review))),
      nextCursor,
    };
  },
});

export const createReview = mutation({
  args: {
    agent_id: v.id("agents"),
    ...reviewInputArgs,
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    if (await hasProviderAccessOrProfile(ctx, userId)) {
      appError(
        "review_provider_forbidden",
        "Provider accounts can't leave reviews.",
        403
      );
    }

    const gccProfile = await getGccProfile(ctx, userId);
    if (!gccProfile) {
      appError(
        "gcc_profile_required",
        "Complete your profile setup before leaving a review.",
        403
      );
    }

    const { agent, company } = await getAgentAndCompanyForReview(ctx, args.agent_id);

    const existingReview = await getReviewByReviewerAndAgent(ctx, userId, agent._id);
    if (existingReview) {
      appError(
        "review_already_exists",
        "You already have a review for this agent.",
        409
      );
    }

    const normalized = normalizeReviewInput(args);
    const now = Date.now();
    const reviewId = await ctx.db.insert("reviews", {
      reviewer_id: userId,
      reviewer_name: gccProfile.name,
      reviewer_organization: gccProfile.organization,
      agent_id: agent._id,
      company_id: company._id,
      ...normalized,
      status: "pending",
      created_at: now,
      updated_at: now,
    });

    await scheduleAdminAlert(ctx, "review");
    return reviewId;
  },
});

export const updateMyReview = mutation({
  args: {
    review_id: v.id("reviews"),
    ...reviewInputArgs,
  },
  handler: async (ctx, { review_id, ...input }) => {
    const userId = await requireAuth(ctx);
    const review = await ctx.db.get(review_id);
    if (!review) {
      appError("review_not_found", "Review not found.", 404);
    }
    if (review.reviewer_id !== userId) {
      appError("review_forbidden", "Not authorized to edit this review.", 403);
    }
    if (review.status === "removed") {
      appError("review_removed", "Removed reviews cannot be edited.", 400);
    }
    if (await hasProviderAccessOrProfile(ctx, userId)) {
      appError(
        "review_provider_forbidden",
        "Provider accounts can't edit reviews.",
        403
      );
    }

    const normalized = normalizeReviewInput(input);
    const wasApproved = review.status === "approved";
    const now = Date.now();

    await ctx.db.patch(review_id, {
      ...normalized,
      status: "pending",
      moderation_reason: undefined,
      admin_notes: undefined,
      reviewed_at: undefined,
      updated_at: now,
    });

    if (wasApproved) {
      await recalculateAgentMetrics(ctx, review.agent_id);
    }

    await scheduleAdminAlert(ctx, "review");
    return review_id;
  },
});

export const submitResponse = mutation({
  args: {
    review_id: v.id("reviews"),
    body: v.string(),
  },
  handler: async (ctx, { review_id, body }) => {
    const userId = await requireAuth(ctx);
    const review = await ctx.db.get(review_id);
    if (!review) {
      appError("review_not_found", "Review not found.", 404);
    }
    if (review.status !== "approved") {
      appError(
        "review_response_review_unavailable",
        "You can respond once this review is published.",
        400
      );
    }

    await getAgentAndCompanyForReview(ctx, review.agent_id);
    const membership = await getActiveMembershipForCompany(ctx, userId, review.company_id);
    if (!membership) {
      appError(
        "provider_membership_required",
        "Only active team members can view and respond to reviews.",
        403
      );
    }

    const responderName = membership.email;
    const normalizedBody = cleanRequiredText(body, "Response", 20);
    const existingResponse = await getResponseByReviewId(ctx, review_id);
    const now = Date.now();

    if (existingResponse) {
      if (existingResponse.status === "removed") {
        appError("review_response_removed", "Removed responses cannot be edited.", 400);
      }

      await ctx.db.patch(existingResponse._id, {
        body: normalizedBody,
        responder_id: userId,
        responder_name: responderName,
        status: "pending",
        moderation_reason: undefined,
        admin_notes: undefined,
        reviewed_at: undefined,
        updated_at: now,
      });

      await scheduleAdminAlert(ctx, "review response");
      return existingResponse._id;
    }

    const responseId = await ctx.db.insert("reviewResponses", {
      review_id,
      company_id: review.company_id,
      responder_id: userId,
      responder_name: responderName,
      body: normalizedBody,
      status: "pending",
      created_at: now,
      updated_at: now,
    });

    await scheduleAdminAlert(ctx, "review response");
    return responseId;
  },
});

export const getPendingReviews = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_status_created", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    return await Promise.all(reviews.map((review) => buildAdminReviewRecord(ctx, review)));
  },
});

export const getPendingReviewResponses = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const responses = await ctx.db
      .query("reviewResponses")
      .withIndex("by_status_created", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    return await Promise.all(
      responses.map(async (response) => {
        const review = await ctx.db.get(response.review_id);
        const agent = review ? await ctx.db.get(review.agent_id) : null;
        const company = review
          ? await withResolvedLogoUrl(ctx, await ctx.db.get(review.company_id))
          : null;

        return {
          ...response,
          review,
          agent,
          company,
        };
      })
    );
  },
});

export const getReviewsHistory = query({
  args: { cursor: v.optional(v.number()), limit: v.optional(v.number()) },
  handler: async (ctx, { cursor, limit }) => {
    await requireAdmin(ctx);
    const pageSize = clampLimit(limit, 25, 50);
    const offset = Math.max(0, cursor ?? 0);
    const allReviews = (await ctx.db.query("reviews").collect())
      .filter((review) => review.status !== "pending")
      .sort(sortByRecent);
    const page = allReviews.slice(offset, offset + pageSize);
    const nextCursor = offset + page.length < allReviews.length ? offset + page.length : null;

    return {
      reviews: await Promise.all(page.map((review) => buildAdminReviewRecord(ctx, review))),
      nextCursor,
    };
  },
});

export const getReviewResponsesHistory = query({
  args: { cursor: v.optional(v.number()), limit: v.optional(v.number()) },
  handler: async (ctx, { cursor, limit }) => {
    await requireAdmin(ctx);
    const pageSize = clampLimit(limit, 25, 50);
    const offset = Math.max(0, cursor ?? 0);
    const allResponses = (await ctx.db.query("reviewResponses").collect())
      .filter((response) => response.status !== "pending")
      .sort(sortByRecent);
    const page = allResponses.slice(offset, offset + pageSize);
    const nextCursor =
      offset + page.length < allResponses.length ? offset + page.length : null;

    return {
      responses: await Promise.all(
        page.map(async (response) => {
          const review = await ctx.db.get(response.review_id);
          const agent = review ? await ctx.db.get(review.agent_id) : null;
          const company = review
            ? await withResolvedLogoUrl(ctx, await ctx.db.get(review.company_id))
            : null;

          return {
            ...response,
            review,
            agent,
            company,
          };
        })
      ),
      nextCursor,
    };
  },
});

async function notifyProviderMembersAboutApprovedReview(
  ctx: ReviewWriterCtx,
  review: Doc<"reviews">,
  reviewedAt: number
) {
  const agent = await ctx.db.get(review.agent_id);
  if (!agent) {
    return;
  }

  await createCompanyMemberNotifications(ctx, {
    audienceRole: "provider",
    type: "provider.review.approved",
    title: "New review published",
    body: `A new ${review.rating_overall}-star review is live for ${agent.agent_name}.`,
    link: "/dashboard?tab=reviews",
    entityType: "review",
    entityId: review._id,
    companyId: review.company_id,
    dedupeKey: `provider.review.approved:${review._id}:${reviewedAt}`,
  });
}

export const approveReview = mutation({
  args: { review_id: v.id("reviews") },
  handler: async (ctx, { review_id }) => {
    const adminIdentity = await requireAdmin(ctx);
    const review = await ctx.db.get(review_id);
    if (!review) {
      appError("review_not_found", "Review not found.", 404);
    }
    if (review.status !== "pending") {
      appError("review_state_invalid", "Only pending reviews can be approved.", 400);
    }

    const reviewedAt = Date.now();
    await ctx.db.patch(review_id, {
      status: "approved",
      moderation_reason: undefined,
      admin_notes: undefined,
      reviewed_at: reviewedAt,
    });

    await recalculateAgentMetrics(ctx, review.agent_id);
    await notifyProviderMembersAboutApprovedReview(ctx, review, reviewedAt);
    await ctx.runMutation(internal.admin.logAuditEventInternal, {
      actor_user_id: adminIdentity.subject,
      action: "review.approved",
      entity_type: "review",
      entity_id: String(review._id),
    });
  },
});

export const rejectReview = mutation({
  args: {
    review_id: v.id("reviews"),
    moderation_reason: v.optional(v.string()),
    admin_notes: v.optional(v.string()),
  },
  handler: async (ctx, { review_id, moderation_reason, admin_notes }) => {
    const adminIdentity = await requireAdmin(ctx);
    const review = await ctx.db.get(review_id);
    if (!review) {
      appError("review_not_found", "Review not found.", 404);
    }
    if (review.status !== "pending") {
      appError("review_state_invalid", "Only pending reviews can be rejected.", 400);
    }

    const reviewedAt = Date.now();
    const userVisibleReason = cleanOptionalText(moderation_reason);
    const internalNotes = cleanOptionalText(admin_notes);

    await ctx.db.patch(review_id, {
      status: "rejected",
      moderation_reason: userVisibleReason,
      admin_notes: internalNotes,
      reviewed_at: reviewedAt,
    });

    await createUserNotification(ctx, {
      recipientUserId: review.reviewer_id,
      audienceRole: "gcc",
      type: "gcc.review.rejected",
      title: "Review rejected",
      body:
        userVisibleReason ||
        "Your review was not published. Check your GCC dashboard for details.",
      link: "/gcc-dashboard?tab=my-reviews",
      entityType: "review",
      entityId: review._id,
      dedupeKey: `gcc.review.rejected:${review._id}:${reviewedAt}`,
    });
    await ctx.runMutation(internal.admin.logAuditEventInternal, {
      actor_user_id: adminIdentity.subject,
      action: "review.rejected",
      entity_type: "review",
      entity_id: String(review._id),
    });
  },
});

export const removeReview = mutation({
  args: {
    review_id: v.id("reviews"),
    moderation_reason: v.optional(v.string()),
    admin_notes: v.optional(v.string()),
  },
  handler: async (ctx, { review_id, moderation_reason, admin_notes }) => {
    const adminIdentity = await requireAdmin(ctx);
    const review = await ctx.db.get(review_id);
    if (!review) {
      appError("review_not_found", "Review not found.", 404);
    }
    if (review.status === "removed") {
      appError("review_state_invalid", "Review is already removed.", 400);
    }

    const wasApproved = review.status === "approved";
    const reviewedAt = Date.now();
    const userVisibleReason = cleanOptionalText(moderation_reason);
    const internalNotes = cleanOptionalText(admin_notes);

    await ctx.db.patch(review_id, {
      status: "removed",
      moderation_reason: userVisibleReason,
      admin_notes: internalNotes,
      reviewed_at: reviewedAt,
    });

    if (wasApproved) {
      await recalculateAgentMetrics(ctx, review.agent_id);
    }

    await createUserNotification(ctx, {
      recipientUserId: review.reviewer_id,
      audienceRole: "gcc",
      type: "gcc.review.removed",
      title: "Review removed",
      body:
        userVisibleReason ||
        "Your review was removed after moderation. Check your GCC dashboard for details.",
      link: "/gcc-dashboard?tab=my-reviews",
      entityType: "review",
      entityId: review._id,
      dedupeKey: `gcc.review.removed:${review._id}:${reviewedAt}`,
    });
    await ctx.runMutation(internal.admin.logAuditEventInternal, {
      actor_user_id: adminIdentity.subject,
      action: "review.removed",
      entity_type: "review",
      entity_id: String(review._id),
    });
  },
});

export const approveReviewResponse = mutation({
  args: { response_id: v.id("reviewResponses") },
  handler: async (ctx, { response_id }) => {
    const adminIdentity = await requireAdmin(ctx);
    const response = await ctx.db.get(response_id);
    if (!response) {
      appError("review_response_not_found", "Response not found.", 404);
    }
    if (response.status !== "pending") {
      appError(
        "review_response_state_invalid",
        "Only pending responses can be approved.",
        400
      );
    }

    const review = await ctx.db.get(response.review_id);
    if (!review) {
      appError("review_not_found", "Review not found.", 404);
    }
    const agent = await ctx.db.get(review.agent_id);
    const company = await ctx.db.get(review.company_id);
    const reviewedAt = Date.now();

    await ctx.db.patch(response_id, {
      status: "approved",
      moderation_reason: undefined,
      admin_notes: undefined,
      reviewed_at: reviewedAt,
    });

    await createUserNotification(ctx, {
      recipientUserId: review.reviewer_id,
      audienceRole: "gcc",
      type: "gcc.review.response_approved",
      title: `${company?.name ?? "Provider"} responded to your review`,
      body: `A provider response is now live for ${agent?.agent_name ?? "this agent"}.`,
      link: reviewLinkForAgent(agent),
      entityType: "reviewResponse",
      entityId: response._id,
      dedupeKey: `gcc.review.response_approved:${response._id}:${reviewedAt}`,
    });
    await ctx.runMutation(internal.admin.logAuditEventInternal, {
      actor_user_id: adminIdentity.subject,
      action: "review_response.approved",
      entity_type: "reviewResponse",
      entity_id: String(response._id),
    });
  },
});

export const rejectReviewResponse = mutation({
  args: {
    response_id: v.id("reviewResponses"),
    moderation_reason: v.optional(v.string()),
    admin_notes: v.optional(v.string()),
  },
  handler: async (ctx, { response_id, moderation_reason, admin_notes }) => {
    const adminIdentity = await requireAdmin(ctx);
    const response = await ctx.db.get(response_id);
    if (!response) {
      appError("review_response_not_found", "Response not found.", 404);
    }
    if (response.status !== "pending") {
      appError(
        "review_response_state_invalid",
        "Only pending responses can be rejected.",
        400
      );
    }

    await ctx.db.patch(response_id, {
      status: "rejected",
      moderation_reason: cleanOptionalText(moderation_reason),
      admin_notes: cleanOptionalText(admin_notes),
      reviewed_at: Date.now(),
    });
    await ctx.runMutation(internal.admin.logAuditEventInternal, {
      actor_user_id: adminIdentity.subject,
      action: "review_response.rejected",
      entity_type: "reviewResponse",
      entity_id: String(response._id),
    });
  },
});

export const removeReviewResponse = mutation({
  args: {
    response_id: v.id("reviewResponses"),
    moderation_reason: v.optional(v.string()),
    admin_notes: v.optional(v.string()),
  },
  handler: async (ctx, { response_id, moderation_reason, admin_notes }) => {
    const adminIdentity = await requireAdmin(ctx);
    const response = await ctx.db.get(response_id);
    if (!response) {
      appError("review_response_not_found", "Response not found.", 404);
    }
    if (response.status === "removed") {
      appError("review_response_state_invalid", "Response is already removed.", 400);
    }

    await ctx.db.patch(response_id, {
      status: "removed",
      moderation_reason: cleanOptionalText(moderation_reason),
      admin_notes: cleanOptionalText(admin_notes),
      reviewed_at: Date.now(),
    });
    await ctx.runMutation(internal.admin.logAuditEventInternal, {
      actor_user_id: adminIdentity.subject,
      action: "review_response.removed",
      entity_type: "reviewResponse",
      entity_id: String(response._id),
    });
  },
});

export const _createReviewSolicitationNotification = internalMutation({
  args: {
    provider_request_id: v.id("providerRequests"),
  },
  handler: async (ctx, { provider_request_id }) => {
    const providerRequest = await ctx.db.get(provider_request_id);
    if (!providerRequest) {
      return null;
    }

    const agent = await ctx.db.get(providerRequest.agent_id);
    if (!agent) {
      return null;
    }

    return await createUserNotification(ctx, {
      recipientUserId: providerRequest.gcc_user_id,
      audienceRole: "gcc",
      type: "gcc.review.solicitation",
      title: "How was your experience?",
      body: `You recently connected with ${agent.agent_name}. Leave a review to share your experience.`,
      link: reviewLinkForAgent(agent),
      entityType: "providerRequest",
      entityId: providerRequest._id,
      dedupeKey: `gcc.review.solicitation:${providerRequest._id}`,
    });
  },
});
