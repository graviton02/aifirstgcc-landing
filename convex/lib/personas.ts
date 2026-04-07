import type { MutationCtx, QueryCtx } from "../_generated/server";
import { appError } from "./errors";

type PersonaReaderCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

async function hasProviderAssociation(ctx: PersonaReaderCtx, userId: string) {
  const [providerProfile, memberships, submissions, claims] = await Promise.all([
    ctx.db
      .query("providerProfiles")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .unique(),
    ctx.db
      .query("companyMembers")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .collect(),
    ctx.db
      .query("companySubmissions")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .collect(),
    ctx.db
      .query("claimRequests")
      .withIndex("by_claimantUserId", (q) => q.eq("claimant_user_id", userId))
      .collect(),
  ]);

  const hasActiveMembership = memberships.some((membership) => membership.status === "active");
  const hasOpenSubmission = submissions.some(
    (submission) => submission.status === "pending" || submission.status === "approved"
  );
  const hasOpenClaim = claims.some(
    (claim) =>
      claim.status === "pending" ||
      claim.status === "approved" ||
      claim.status === "activated"
  );

  return Boolean(providerProfile || hasActiveMembership || hasOpenSubmission || hasOpenClaim);
}

async function hasGccAssociation(ctx: PersonaReaderCtx, userId: string) {
  const profile = await ctx.db
    .query("gccProfiles")
    .withIndex("by_userId", (q) => q.eq("user_id", userId))
    .unique();

  return Boolean(profile);
}

export async function assertCanCreateProviderPersona(
  ctx: PersonaReaderCtx,
  userId: string
) {
  if (await hasGccAssociation(ctx, userId)) {
    appError(
      "persona_conflict_gcc_exists",
      "This account is already set up as a GCC account. Use a different email if you need provider access.",
      409
    );
  }
}

export async function assertCanCreateGccPersona(
  ctx: PersonaReaderCtx,
  userId: string
) {
  if (await hasProviderAssociation(ctx, userId)) {
    appError(
      "persona_conflict_provider_exists",
      "This account is already set up as a provider account. Use a different email if you need GCC access.",
      409
    );
  }
}
