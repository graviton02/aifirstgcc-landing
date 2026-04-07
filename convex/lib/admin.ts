import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import { appError } from "./errors";

type AdminAuthCtx = Pick<QueryCtx, "auth"> | Pick<MutationCtx, "auth"> | Pick<ActionCtx, "auth">;

function getAdminUserIds() {
  return new Set(
    (process.env.ADMIN_CLERK_USER_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function getAdminEmails() {
  return new Set(
    (process.env.ADMIN_CLERK_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminUserId(userId?: string | null) {
  if (!userId) {
    return false;
  }

  return getAdminUserIds().has(userId);
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getAdminEmails().has(email.trim().toLowerCase());
}

function isAdminIdentity(identity?: { subject?: string | null; email?: string | null } | null) {
  return Boolean(
    identity &&
      (isAdminUserId(identity.subject) || isAdminEmail(identity.email))
  );
}

export async function requireAdmin(ctx: AdminAuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    appError("unauthenticated", "Unauthenticated", 401);
  }

  if (!isAdminIdentity(identity)) {
    appError("forbidden_admin", "Admin access required", 403);
  }

  return identity;
}

export async function getAdminViewerAccess(ctx: AdminAuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  return {
    isAuthenticated: Boolean(identity),
    isAdmin: isAdminIdentity(identity),
    userId: identity?.subject ?? null,
  };
}
