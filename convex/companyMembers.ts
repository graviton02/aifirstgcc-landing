import { query, mutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAuth } from "./lib/auth";
import { appError } from "./lib/errors";
import { createCompanyOwnerNotifications } from "./notifications";
import { upsertProviderProfile } from "./providerProfiles";

type MembershipReaderCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

async function getMembershipsForUser(
  ctx: MembershipReaderCtx,
  userId: string
): Promise<Doc<"companyMembers">[]> {
  return await ctx.db
    .query("companyMembers")
    .withIndex("by_userId", (q) => q.eq("user_id", userId))
    .collect();
}

export async function getActiveMembershipForUser(
  ctx: MembershipReaderCtx,
  userId: string
): Promise<Doc<"companyMembers"> | null> {
  const memberships = await getMembershipsForUser(ctx, userId);
  return memberships
    .filter((membership) => membership.status === "active")
    .sort((a, b) => b.updated_at - a.updated_at)[0] ?? null;
}

export async function getActiveMembershipForCompany(
  ctx: MembershipReaderCtx,
  userId: string,
  companyId: Id<"companies">
): Promise<Doc<"companyMembers"> | null> {
  const memberships = await getMembershipsForUser(ctx, userId);
  return memberships
    .filter(
      (membership) =>
        membership.company_id === companyId && membership.status === "active"
    )
    .sort((a, b) => b.updated_at - a.updated_at)[0] ?? null;
}

export async function requireActiveMembership(
  ctx: MembershipReaderCtx,
  userId: string,
  companyId: Id<"companies">
): Promise<Doc<"companyMembers">> {
  const membership = await getActiveMembershipForCompany(ctx, userId, companyId);
  if (!membership) {
    appError("forbidden_company_access", "Not authorized for this company", 403);
  }
  return membership;
}

async function requireOwnerMembership(
  ctx: MembershipReaderCtx,
  userId: string,
  companyId: Id<"companies">
): Promise<Doc<"companyMembers">> {
  const membership = await getActiveMembershipForCompany(ctx, userId, companyId);
  if (
    !membership ||
    membership.role !== "owner" ||
    membership.status !== "active"
  ) {
    appError("forbidden_company_owner", "Only the company owner can manage team members", 403);
  }
  return membership;
}

export const getMyCompany = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;
    const membership = await getActiveMembershipForUser(ctx, userId);
    if (!membership) return null;
    const company = await ctx.db.get(membership.company_id);
    if (!company) return null;
    return {
      ...company,
      membership_role: membership.role,
      membership_status: membership.status,
    };
  },
});

export const getMembers = query({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    const userId = await requireAuth(ctx);
    const membership = await getActiveMembershipForCompany(ctx, userId, company_id);
    if (!membership) {
      appError(
        "forbidden_company_access",
        "Not authorized to view team members",
        403
      );
    }

    return await ctx.db
      .query("companyMembers")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
  },
});

export const getMember = query({
  args: { member_id: v.id("companyMembers") },
  handler: async (ctx, { member_id }) => {
    const userId = await requireAuth(ctx);
    const member = await ctx.db.get(member_id);
    if (!member) return null;

    await requireActiveMembership(ctx, userId, member.company_id);

    return member;
  },
});

export const inviteMember = mutation({
  args: { company_id: v.id("companies"), email: v.string() },
  handler: async (ctx, { company_id, email }) => {
    const userId = await requireAuth(ctx);
    const membership = await requireOwnerMembership(ctx, userId, company_id);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      appError("validation_email_required", "Email is required", 400);
    }
    if (normalizedEmail === membership.email.toLowerCase()) {
      appError("invite_owner_duplicate", "You are already the owner of this company", 400);
    }

    const existingMembers = await ctx.db
      .query("companyMembers")
      .withIndex("by_companyAndEmail", (q) => q.eq("company_id", company_id).eq("email", normalizedEmail))
      .collect();

    const activeMember = existingMembers.find((member) => member.status === "active");
    if (activeMember) {
      appError("invite_member_exists", "That email already has access to this company", 400);
    }

    const pendingInvite = existingMembers.find((member) => member.status === "pending");
    if (pendingInvite) {
      appError("invite_member_pending", "An invite is already pending for that email", 400);
    }

    const now = Date.now();
    return await ctx.db.insert("companyMembers", {
      company_id,
      email: normalizedEmail,
      role: "member",
      status: "pending",
      invited_by: userId,
      created_at: now,
      updated_at: now,
    });
  },
});

export const recordClerkInvitation = mutation({
  args: {
    member_id: v.id("companyMembers"),
    clerk_invitation_id: v.string(),
    invite_url: v.optional(v.string()),
    invite_expires_at: v.optional(v.number()),
  },
  handler: async (ctx, { member_id, clerk_invitation_id, invite_url, invite_expires_at }) => {
    const userId = await requireAuth(ctx);
    const member = await ctx.db.get(member_id);
    if (!member) appError("member_not_found", "Member not found", 404);

    await requireOwnerMembership(ctx, userId, member.company_id);

    await ctx.db.patch(member_id, {
      clerk_invitation_id,
      ...(invite_url ? { invite_url } : {}),
      ...(invite_expires_at ? { invite_expires_at } : {}),
      updated_at: Date.now(),
    });
  },
});

export const removeMember = mutation({
  args: { member_id: v.id("companyMembers") },
  handler: async (ctx, { member_id }) => {
    const userId = await requireAuth(ctx);
    const member = await ctx.db.get(member_id);
    if (!member) appError("member_not_found", "Member not found", 404);
    if (member.role === "owner") {
      appError("member_owner_remove", "Cannot remove the company owner", 400);
    }
    await requireOwnerMembership(ctx, userId, member.company_id);
    await ctx.db.delete(member_id);
  },
});

export const syncClerkMemberships = mutation({
  args: {
    memberships: v.array(
      v.object({
        clerk_org_id: v.string(),
        role: v.string(),
      })
    ),
  },
  handler: async (ctx, { memberships }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) appError("unauthenticated", "Unauthenticated", 401);

    const userId = identity.subject;
    const email = identity.email?.trim().toLowerCase();
    if (!email) {
      return { synced_count: 0 };
    }

    const now = Date.now();
    let syncedCount = 0;

    for (const membership of memberships) {
      const company = await ctx.db
        .query("companies")
        .withIndex("by_clerkOrgId", (q) => q.eq("clerk_org_id", membership.clerk_org_id))
        .unique();

      if (!company) continue;

      const existingByEmail = await ctx.db
        .query("companyMembers")
        .withIndex("by_companyAndEmail", (q) => q.eq("company_id", company._id).eq("email", email))
        .collect();

      const existingByUserId = (await getMembershipsForUser(ctx, userId)).find(
        (entry) => entry.company_id === company._id
      );

      const targetMembership = existingByEmail[0] ?? existingByUserId;
      const nextRole = membership.role === "org:admin" ? "owner" : "member";

      if (targetMembership) {
        await ctx.db.patch(targetMembership._id, {
          user_id: userId,
          email,
          role: nextRole,
          status: "active",
          updated_at: now,
        });
      } else {
        await ctx.db.insert("companyMembers", {
          company_id: company._id,
          user_id: userId,
          email,
          role: nextRole,
          status: "active",
          created_at: now,
          updated_at: now,
        });
      }

      syncedCount += 1;
    }

    if (syncedCount > 0) {
      await upsertProviderProfile(ctx, userId);
    }

    return { synced_count: syncedCount };
  },
});

export const acceptPendingInvite = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) appError("unauthenticated", "Unauthenticated", 401);

    const userId = identity.subject;
    const email = identity.email?.trim().toLowerCase();
    if (!email) {
      return { status: "no_email" as const };
    }

    const activeMembership = await getActiveMembershipForUser(ctx, userId);
    if (activeMembership) {
      await upsertProviderProfile(ctx, userId);
      return {
        status: "already_active" as const,
        company_id: activeMembership.company_id,
      };
    }

    const pendingInvites = (await ctx.db
      .query("companyMembers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect())
      .filter((membership: any) => membership.status === "pending");

    if (pendingInvites.length === 0) {
      return { status: "none" as const };
    }

    const uniqueCompanyIds = new Set(pendingInvites.map((membership: any) => String(membership.company_id)));
    if (uniqueCompanyIds.size > 1) {
      return {
        status: "conflict" as const,
        message: "Multiple pending team invites were found for your email. Contact support to resolve them.",
      };
    }

    const invite = pendingInvites.sort((a: any, b: any) => b.created_at - a.created_at)[0];
    const now = Date.now();
    await ctx.db.patch(invite._id, {
      user_id: userId,
      status: "active",
      updated_at: now,
    });

    await upsertProviderProfile(ctx, userId);

    const company = await ctx.db.get(invite.company_id);
    await createCompanyOwnerNotifications(ctx, {
      audienceRole: "provider",
      type: "provider.team_invite.accepted",
      title: "Team invite accepted",
      body: `${email} now has access to ${company?.name ?? "your company workspace"}.`,
      link: "/dashboard?tab=team",
      entityType: "companyMember",
      entityId: invite._id,
      companyId: invite.company_id,
    });

    return {
      status: "accepted" as const,
      company_id: invite.company_id,
    };
  },
});
