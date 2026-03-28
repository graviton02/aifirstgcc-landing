import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { appError } from "./errors";

export async function requireAuth(
  ctx: QueryCtx | MutationCtx | ActionCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) appError("unauthenticated", "Unauthenticated", 401);
  return identity.subject;
}

export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx | ActionCtx
): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
}
