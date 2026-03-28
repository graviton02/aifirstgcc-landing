import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { api, internal } from "./_generated/api";
import { getActiveMembershipForUser } from "./companyMembers";
import { gccReachoutContactedEmail } from "./emails/contactRequest";
import { requireAuth } from "./lib/auth";
import { appError } from "./lib/errors";

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

  const recipients = Array.isArray(to) ? to : [to];
  const resend = new Resend(resendApiKey);

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

function sortRequests<T extends { contacted_at?: number; reviewed_at?: number; created_at: number }>(
  left: T,
  right: T
) {
  return (
    (right.contacted_at ?? right.reviewed_at ?? right.created_at) -
    (left.contacted_at ?? left.reviewed_at ?? left.created_at)
  );
}

export const getMyCompanyLeads = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const membership = await getActiveMembershipForUser(ctx, userId);

    if (!membership) {
      appError(
        "provider_membership_required",
        "Only active provider company members can view leads.",
        403
      );
    }

    const requests = await ctx.db
      .query("providerRequests")
      .withIndex("by_companyId", (q) => q.eq("company_id", membership.company_id))
      .collect();

    const visibleRequests = requests.filter(
      (request) =>
        request.status === "approved" || request.status === "contacted"
    );

    const enriched = await Promise.all(
      visibleRequests.map(async (request) => {
        const agent = await ctx.db.get(request.agent_id);
        const company = request.company_id
          ? await ctx.db.get(request.company_id)
          : null;

        return {
          ...request,
          agent,
          company,
        };
      })
    );

    return enriched.sort(sortRequests);
  },
});

export const _getLeadDetails = internalQuery({
  args: { request_id: v.id("providerRequests") },
  handler: async (ctx, { request_id }) => {
    const request = await ctx.db.get(request_id);
    if (!request) {
      return null;
    }

    const agent = await ctx.db.get(request.agent_id);
    const company = request.company_id ? await ctx.db.get(request.company_id) : null;

    return {
      request,
      agent,
      company,
    };
  },
});

export const _markLeadContactedInternal = internalMutation({
  args: {
    request_id: v.id("providerRequests"),
    contacted_by_user_id: v.string(),
  },
  handler: async (ctx, { request_id, contacted_by_user_id }) => {
    const request = await ctx.db.get(request_id);
    if (!request) {
      appError("provider_request_not_found", "Lead not found.", 404);
    }
    if (request.status !== "approved") {
      appError(
        "provider_request_state_invalid",
        "Only approved leads can be marked contacted.",
        400
      );
    }

    const now = Date.now();

    await ctx.db.patch(request_id, {
      status: "contacted",
      contacted_at: now,
      contacted_by_user_id,
    });

    await ctx.db.insert("contactLogs", {
      gcc_user_id: request.gcc_user_id,
      agent_id: request.agent_id,
      company_id: request.company_id,
      contacted_at: now,
    });
  },
});

export const markLeadContacted = action({
  args: { request_id: v.id("providerRequests") },
  handler: async (ctx, { request_id }) => {
    const userId = await requireAuth(ctx);
    const company = await ctx.runQuery(api.companyMembers.getMyCompany, {});
    if (!company) {
      appError(
        "provider_membership_required",
        "Only active provider company members can update leads.",
        403
      );
    }

    const details = await ctx.runQuery(internal.providerRequests._getLeadDetails, {
      request_id,
    });

    if (!details) {
      appError("provider_request_not_found", "Lead not found.", 404);
    }
    if (!details.request.company_id || details.request.company_id !== company._id) {
      appError(
        "provider_request_forbidden",
        "You are not authorized to update this lead.",
        403
      );
    }

    await ctx.runMutation(internal.providerRequests._markLeadContactedInternal, {
      request_id,
      contacted_by_user_id: userId,
    });

    const email = gccReachoutContactedEmail({
      companyName: details.company?.name ?? "the provider",
      agentName: details.agent?.agent_name ?? "your selected solution",
      dashboardUrl: `${getBaseUrl()}/gcc-dashboard`,
    });

    await sendEmailIfConfigured({
      to: details.request.gcc_email ?? details.request.gcc_user_email ?? "",
      subject: email.subject,
      html: email.html,
    });
  },
});
