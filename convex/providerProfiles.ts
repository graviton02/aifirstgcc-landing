import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

export type ProviderOnboardingPath = "claim_existing" | "create_new";

type ProviderProfileWriterCtx = Pick<MutationCtx, "db">;
type ProviderProfileReaderCtx = Pick<MutationCtx, "db"> | Pick<QueryCtx, "db">;

export async function upsertProviderProfile(
  ctx: ProviderProfileWriterCtx,
  userId: string,
  onboardingPath?: ProviderOnboardingPath
) {
  const existing = await ctx.db
    .query("providerProfiles")
    .withIndex("by_userId", (q) => q.eq("user_id", userId))
    .unique();

  const now = Date.now();

  if (existing) {
    await ctx.db.patch(existing._id, {
      ...(onboardingPath ? { onboarding_path: onboardingPath } : {}),
      updated_at: now,
    });
    return existing._id;
  }

  return await ctx.db.insert("providerProfiles", {
    user_id: userId,
    ...(onboardingPath ? { onboarding_path: onboardingPath } : {}),
    created_at: now,
    updated_at: now,
  });
}

async function getLatestClaimForUser(ctx: ProviderProfileReaderCtx, userId: string) {
  const claims = await ctx.db
    .query("claimRequests")
    .withIndex("by_claimantUserId", (q) => q.eq("claimant_user_id", userId))
    .collect();

  const latestClaim = claims.sort((a, b) => b.created_at - a.created_at)[0];
  if (!latestClaim) {
    return null;
  }

  const company = await ctx.db.get(latestClaim.company_id);
  return {
    ...latestClaim,
    company_name: company?.name ?? "Unknown Company",
    company_slug: company?.slug ?? null,
  };
}

async function getLatestCompanySubmissionForUser(ctx: ProviderProfileReaderCtx, userId: string) {
  const submissions = await ctx.db
    .query("companySubmissions")
    .withIndex("by_userId", (q) => q.eq("user_id", userId))
    .collect();

  const latestSubmission = submissions.sort((a, b) => b.created_at - a.created_at)[0];
  if (!latestSubmission) {
    return null;
  }

  const createdCompany = latestSubmission.created_company_id
    ? await ctx.db.get(latestSubmission.created_company_id)
    : null;

  return {
    ...latestSubmission,
    created_company_name: createdCompany?.name ?? null,
    created_company_slug: createdCompany?.slug ?? null,
  };
}

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("providerProfiles")
      .withIndex("by_userId", (q) => q.eq("user_id", identity.subject))
      .unique();
  },
});

export const getSetupState = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userId = identity.subject;
    const profile = await ctx.db
      .query("providerProfiles")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .unique();

    const [claimRequest, companySubmission] = await Promise.all([
      getLatestClaimForUser(ctx, userId),
      getLatestCompanySubmissionForUser(ctx, userId),
    ]);

    return {
      profile,
      claimRequest,
      companySubmission,
    };
  },
});

export const ensureProvider = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return await upsertProviderProfile(ctx, userId);
  },
});

export const setOnboardingPath = mutation({
  args: {
    onboarding_path: v.union(v.literal("claim_existing"), v.literal("create_new")),
  },
  handler: async (ctx, { onboarding_path }) => {
    const userId = await requireAuth(ctx);
    return await upsertProviderProfile(ctx, userId, onboarding_path);
  },
});
