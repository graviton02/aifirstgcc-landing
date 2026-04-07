import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { appError } from "./lib/errors";
import { withResolvedLogoUrl } from "./lib/companyLogos";
import { normalizeProviderRequest } from "./lib/providerRequests";

const requestSourceValidator = v.union(
  v.literal("agent_detail"),
  v.literal("company_profile")
);
const BLOCKING_REQUEST_STATUSES = new Set([
  "pending_admin",
  "approved",
  "contacted",
] as const);

function cleanRequiredText(value: string, label: string, minLength = 8) {
  const cleaned = value.trim();
  if (cleaned.length < minLength) {
    appError(
      "contact_request_validation_error",
      `${label} must be at least ${minLength} characters.`,
      400
    );
  }
  return cleaned;
}

function sortRequests<T extends { contacted_at?: number; reviewed_at?: number; created_at: number }>(
  left: T,
  right: T
) {
  return (
    (right.contacted_at ?? right.reviewed_at ?? right.created_at) -
    (left.contacted_at ?? left.reviewed_at ?? left.created_at)
  );
}

async function getLatestBlockingProviderRequest(
  ctx: any,
  gccUserId: string,
  companyId: any
) {
  const requests: Array<any> = await ctx.db
    .query("providerRequests")
    .withIndex("by_gccUserAndCompany", (q: any) =>
      q.eq("gcc_user_id", gccUserId).eq("company_id", companyId)
    )
    .collect();

  return requests
    .filter((request: any) => BLOCKING_REQUEST_STATUSES.has(request.status))
    .sort(sortRequests)[0] ?? null;
}

export const getMyContactRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const requests = await ctx.db
      .query("providerRequests")
      .withIndex("by_gccUserId", (q) => q.eq("gcc_user_id", userId))
      .collect();
    const myReviews = await ctx.db
      .query("reviews")
      .withIndex("by_reviewer", (q) => q.eq("reviewer_id", userId))
      .collect();

    const reviewByAgentId = new Map(
      myReviews.map((review) => [review.agent_id, review])
    );

    const enriched = await Promise.all(
      requests.map(async (request) => {
        const agent = await ctx.db.get(request.agent_id);
        const company = request.company_id
          ? await withResolvedLogoUrl(ctx, await ctx.db.get(request.company_id))
          : null;
        const review = reviewByAgentId.get(request.agent_id);

        return {
          ...normalizeProviderRequest(request),
          agent,
          company,
          review_id: review?._id ?? null,
          review_status: review?.status ?? null,
        };
      })
    );

    return enriched.sort(sortRequests);
  },
});

export const getMyProviderRequestStatus = query({
  args: {
    company_id: v.id("companies"),
  },
  handler: async (ctx, { company_id }) => {
    const userId = await requireAuth(ctx);
    const request = await getLatestBlockingProviderRequest(ctx, userId, company_id);

    return request ? normalizeProviderRequest(request) : null;
  },
});

export const createContactRequest = mutation({
  args: {
    agent_id: v.id("agents"),
    use_case: v.string(),
    current_challenge: v.string(),
    expected_outcome: v.string(),
    timeline: v.string(),
    request_source: requestSourceValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const gccProfile = await ctx.db
      .query("gccProfiles")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .unique();

    if (!gccProfile) {
      appError(
        "gcc_profile_required",
        "Complete GCC onboarding before contacting providers.",
        403
      );
    }

    const agent = await ctx.db.get(args.agent_id);
    if (!agent || agent.status !== "active") {
      appError("contact_request_agent_not_found", "Agent not found.", 404);
    }
    if (!agent.company_id) {
      appError(
        "contact_request_company_missing",
        "This agent is not linked to a provider company.",
        400
      );
    }

    const company = await ctx.db.get(agent.company_id);
    if (!company || company.claim_status !== "claimed") {
      appError(
        "contact_request_unavailable",
        "Reachout requests are only available for provider-owned listings.",
        400
      );
    }

    const existingRequest = await getLatestBlockingProviderRequest(
      ctx,
      userId,
      agent.company_id
    );
    if (existingRequest) {
      appError(
        "contact_request_duplicate",
        "You have already contacted this provider. Track the request from your GCC dashboard.",
        409
      );
    }

    const now = Date.now();

    return await ctx.db.insert("providerRequests", {
      company_id: agent.company_id,
      gcc_user_id: userId,
      gcc_name: gccProfile.name,
      gcc_email: gccProfile.email,
      gcc_organization: gccProfile.organization,
      gcc_industry: gccProfile.industry,
      agent_id: args.agent_id,
      use_case: cleanRequiredText(args.use_case, "Use case", 6),
      current_challenge: cleanRequiredText(
        args.current_challenge,
        "Current challenge"
      ),
      expected_outcome: cleanRequiredText(
        args.expected_outcome,
        "Expected outcome"
      ),
      timeline: cleanRequiredText(args.timeline, "Timeline", 3),
      request_source: args.request_source,
      status: "pending_admin",
      created_at: now,
      // Legacy fields preserved for compatibility with older UI/history code.
      gcc_user_email: gccProfile.email,
      message: args.current_challenge.trim(),
    });
  },
});
