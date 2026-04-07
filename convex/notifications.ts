import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { notificationEmail } from "./emails/notification";
import { requireAuth } from "./lib/auth";
import { appError } from "./lib/errors";

type AudienceRole = "provider" | "gcc";
type NotificationEntityType =
  | "claimRequest"
  | "companySubmission"
  | "companyEdit"
  | "agentSubmission"
  | "agentEdit"
  | "providerRequest"
  | "companyMember"
  | "review"
  | "reviewResponse";

type NotificationWriteCtx = Pick<MutationCtx, "db" | "scheduler">;
type NotificationReadCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

type NotificationArgs = {
  recipientUserId: string;
  audienceRole: AudienceRole;
  type: string;
  title: string;
  body: string;
  link: string;
  entityType: NotificationEntityType;
  entityId: string;
  metadata?: Record<string, unknown>;
  dedupeKey?: string;
  shouldEmail?: boolean;
  recipientEmail?: string;
  emailSubject?: string;
  emailCtaLabel?: string;
};

function shouldScheduleEmails() {
  return process.env.NODE_ENV !== "test" && !process.env.VITEST;
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://orbys360.com";
}

function toAbsoluteUrl(link: string) {
  if (/^https?:\/\//i.test(link)) {
    return link;
  }

  const baseUrl = getBaseUrl().replace(/\/+$/, "");
  const path = link.startsWith("/") ? link : `/${link}`;
  return `${baseUrl}${path}`;
}

function getDedupeKey(type: string, entityId: string, recipientUserId: string) {
  return `${type}:${entityId}:${recipientUserId}`;
}

function resolveDedupeKey(args: Pick<NotificationArgs, "type" | "entityId" | "recipientUserId" | "dedupeKey">) {
  return args.dedupeKey
    ? `${args.dedupeKey}:${args.recipientUserId}`
    : getDedupeKey(args.type, args.entityId, args.recipientUserId);
}

async function getActiveCompanyOwners(
  ctx: NotificationReadCtx,
  companyId: Id<"companies">
): Promise<Array<{ userId: string; email: string }>> {
  const memberships = await ctx.db
    .query("companyMembers")
    .withIndex("by_companyId", (q) => q.eq("company_id", companyId))
    .collect();

  const owners = memberships.filter(
    (membership) =>
      membership.status === "active" &&
      membership.role === "owner" &&
      Boolean(membership.user_id)
  );

  const deduped = new Map<string, string>();
  for (const owner of owners) {
    deduped.set(owner.user_id!, owner.email);
  }

  return Array.from(deduped.entries()).map(([userId, email]) => ({
    userId,
    email,
  }));
}

async function getActiveCompanyMembers(
  ctx: NotificationReadCtx,
  companyId: Id<"companies">
): Promise<Array<{ userId: string; email: string }>> {
  const memberships = await ctx.db
    .query("companyMembers")
    .withIndex("by_companyId", (q) => q.eq("company_id", companyId))
    .collect();

  const activeMembers = memberships.filter(
    (membership) => membership.status === "active" && Boolean(membership.user_id)
  );

  const deduped = new Map<string, string>();
  for (const member of activeMembers) {
    deduped.set(member.user_id!, member.email);
  }

  return Array.from(deduped.entries()).map(([userId, email]) => ({
    userId,
    email,
  }));
}

async function getCompanyMembershipEmail(
  ctx: NotificationReadCtx,
  companyId: Id<"companies">,
  userId: string
) {
  const memberships = await ctx.db
    .query("companyMembers")
    .withIndex("by_companyId", (q) => q.eq("company_id", companyId))
    .collect();

  const membership = memberships
    .filter(
      (entry) => entry.status === "active" && entry.user_id === userId
    )
    .sort((left, right) => right.updated_at - left.updated_at)[0];

  return membership?.email;
}

export async function createUserNotification(
  ctx: NotificationWriteCtx,
  args: NotificationArgs
) {
  const dedupeKey = resolveDedupeKey(args);
  const existing = await ctx.db
    .query("notifications")
    .withIndex("by_dedupeKey", (q) => q.eq("dedupe_key", dedupeKey))
    .unique();

  if (existing) {
    return existing._id;
  }

  const notificationId = await ctx.db.insert("notifications", {
    recipient_user_id: args.recipientUserId,
    audience_role: args.audienceRole,
    type: args.type,
    title: args.title,
    body: args.body,
    link: args.link,
    entity_type: args.entityType,
    entity_id: args.entityId,
    metadata: args.metadata,
    dedupe_key: dedupeKey,
    created_at: Date.now(),
  });

  if (args.shouldEmail && args.recipientEmail && shouldScheduleEmails()) {
    await ctx.scheduler.runAfter(0, internal.notifications.sendNotificationEmail, {
      notification_id: notificationId,
      recipient_email: args.recipientEmail,
      title: args.emailSubject ?? args.title,
      body: args.body,
      link: args.link,
      cta_label: args.emailCtaLabel ?? "View update",
    });
  }

  return notificationId;
}

export async function createCompanyOwnerNotifications(
  ctx: NotificationWriteCtx,
  args: Omit<NotificationArgs, "recipientUserId"> & {
    companyId: Id<"companies">;
    submitterUserId?: string;
    submitterEmail?: string;
  }
) {
  const recipients = new Map<string, string>();
  const owners = await getActiveCompanyOwners(ctx, args.companyId);

  for (const owner of owners) {
    recipients.set(owner.userId, owner.email);
  }

  if (args.submitterUserId) {
    const submitterEmail =
      args.submitterEmail ??
      (await getCompanyMembershipEmail(ctx, args.companyId, args.submitterUserId));
    recipients.set(args.submitterUserId, submitterEmail ?? "");
  }

  const notifications: Id<"notifications">[] = [];
  for (const [recipientUserId, recipientEmail] of recipients.entries()) {
    const notificationId = await createUserNotification(ctx, {
      ...args,
      recipientUserId,
      recipientEmail: recipientEmail || undefined,
    });

    notifications.push(notificationId);
  }

  return notifications;
}

export async function createCompanyMemberNotifications(
  ctx: NotificationWriteCtx,
  args: Omit<NotificationArgs, "recipientUserId"> & {
    companyId: Id<"companies">;
    submitterUserId?: string;
    submitterEmail?: string;
  }
) {
  const recipients = new Map<string, string>();
  const members = await getActiveCompanyMembers(ctx, args.companyId);

  for (const member of members) {
    recipients.set(member.userId, member.email);
  }

  if (args.submitterUserId) {
    const submitterEmail =
      args.submitterEmail ??
      (await getCompanyMembershipEmail(ctx, args.companyId, args.submitterUserId));
    recipients.set(args.submitterUserId, submitterEmail ?? "");
  }

  const notifications: Id<"notifications">[] = [];
  for (const [recipientUserId, recipientEmail] of recipients.entries()) {
    const notificationId = await createUserNotification(ctx, {
      ...args,
      recipientUserId,
      recipientEmail: recipientEmail || undefined,
    });

    notifications.push(notificationId);
  }

  return notifications;
}

export const createUserNotificationInternal = internalMutation({
  args: {
    recipient_user_id: v.string(),
    audience_role: v.union(v.literal("provider"), v.literal("gcc")),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    link: v.string(),
    entity_type: v.string(),
    entity_id: v.string(),
    metadata: v.optional(v.any()),
    dedupe_key: v.optional(v.string()),
    should_email: v.optional(v.boolean()),
    recipient_email: v.optional(v.string()),
    email_subject: v.optional(v.string()),
    email_cta_label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await createUserNotification(ctx, {
      recipientUserId: args.recipient_user_id,
      audienceRole: args.audience_role,
      type: args.type,
      title: args.title,
      body: args.body,
      link: args.link,
      entityType: args.entity_type as NotificationEntityType,
      entityId: args.entity_id,
      metadata: args.metadata,
      dedupeKey: args.dedupe_key,
      shouldEmail: args.should_email,
      recipientEmail: args.recipient_email,
      emailSubject: args.email_subject,
      emailCtaLabel: args.email_cta_label,
    });
  },
});

export const markEmailSent = internalMutation({
  args: { notification_id: v.id("notifications") },
  handler: async (ctx, { notification_id }) => {
    const notification = await ctx.db.get(notification_id);
    if (!notification) return;

    await ctx.db.patch(notification_id, {
      emailed_at: Date.now(),
    });
  },
});

export const sendNotificationEmail = internalAction({
  args: {
    notification_id: v.optional(v.id("notifications")),
    recipient_email: v.string(),
    title: v.string(),
    body: v.string(),
    link: v.string(),
    cta_label: v.string(),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || !args.recipient_email) {
      return;
    }

    const email = notificationEmail({
      title: args.title,
      body: args.body,
      ctaLabel: args.cta_label,
      destinationUrl: toAbsoluteUrl(args.link),
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Orbys360 <noreply@orbys360.com>",
        to: args.recipient_email,
        subject: email.subject,
        html: email.html,
      }),
    });

    if (args.notification_id) {
      await ctx.runMutation(internal.notifications.markEmailSent, {
        notification_id: args.notification_id,
      });
    }
  },
});

export const listMine = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const userId = await requireAuth(ctx);
    const pageSize = Math.max(1, Math.min(limit ?? 15, 50));

    return await ctx.db
      .query("notifications")
      .withIndex("by_recipientUserIdAndCreatedAt", (q) =>
        q.eq("recipient_user_id", userId)
      )
      .order("desc")
      .take(pageSize);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipientUserIdAndCreatedAt", (q) =>
        q.eq("recipient_user_id", userId)
      )
      .collect();

    return notifications.filter((notification) => !notification.read_at).length;
  },
});

export const markRead = mutation({
  args: { notification_id: v.id("notifications") },
  handler: async (ctx, { notification_id }) => {
    const userId = await requireAuth(ctx);
    const notification = await ctx.db.get(notification_id);
    if (!notification) appError("notification_not_found", "Notification not found", 404);
    if (notification.recipient_user_id !== userId) {
      appError("notification_forbidden", "Not authorized to update this notification", 403);
    }

    if (!notification.read_at) {
      await ctx.db.patch(notification_id, {
        read_at: Date.now(),
      });
    }

    return { success: true };
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipientUserIdAndCreatedAt", (q) =>
        q.eq("recipient_user_id", userId)
      )
      .collect();

    const unread = notifications.filter((notification) => !notification.read_at);
    const readAt = Date.now();

    await Promise.all(
      unread.map((notification) =>
        ctx.db.patch(notification._id, {
          read_at: readAt,
        })
      )
    );

    return { updated: unread.length };
  },
});
