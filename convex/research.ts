import { mutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { appError } from "./lib/errors";
import { researchDeliveryEmail } from "./emails/researchDelivery";

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com",
  "aol.com", "icloud.com", "mail.com", "protonmail.com", "zoho.com",
  "yandex.com", "gmx.com", "fastmail.com", "tutanota.com", "yahoo.co.uk",
  "yahoo.co.in", "rediffmail.com", "msn.com",
]);

const REPORTS: Record<string, { title: string; subtitle: string; path: string }> = {
  "the-gcc-reckoning": {
    title: "The GCC Reckoning",
    subtitle: "How AI Is Rewriting the Economics of Global Capability Centers",
    path: "/research/the-gcc-reckoning.pdf",
  },
};

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://orbys360.com"
  );
}

function shouldScheduleEmails() {
  return process.env.NODE_ENV !== "test" && !process.env.VITEST;
}

export const submitResearchLead = mutation({
  args: {
    report_slug: v.string(),
    full_name: v.string(),
    position: v.string(),
    email: v.string(),
    industry: v.string(),
    user_agent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const report = REPORTS[args.report_slug];
    if (!report) {
      appError("research_report_not_found", "Unknown research report.", 404);
    }

    const fullName = args.full_name.trim();
    if (fullName.length < 2) {
      appError("research_name_short", "Please enter your full name.", 400);
    }

    const position = args.position.trim();
    if (position.length < 2) {
      appError("research_position_required", "Please enter your position.", 400);
    }

    const email = args.email.trim().toLowerCase();
    if (!email.includes("@") || !email.includes(".")) {
      appError("research_email_invalid", "Please enter a valid email address.", 400);
    }
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain || FREE_EMAIL_DOMAINS.has(domain)) {
      appError(
        "research_email_free_provider",
        "Please use a company email address, not a free email provider.",
        400
      );
    }

    const industry = args.industry.trim();
    if (industry.length < 2) {
      appError("research_industry_required", "Please select your industry.", 400);
    }

    await ctx.db.insert("researchLeads", {
      report_slug: args.report_slug,
      full_name: fullName,
      position,
      email,
      industry,
      user_agent: args.user_agent,
      created_at: Date.now(),
    });

    const downloadUrl = `${getBaseUrl().replace(/\/+$/, "")}${report.path}`;

    if (shouldScheduleEmails()) {
      await ctx.scheduler.runAfter(0, internal.research.sendResearchDeliveryEmail, {
        recipient_email: email,
        recipient_name: fullName,
        report_title: report.title,
        report_subtitle: report.subtitle,
        download_url: downloadUrl,
      });
    }

    return {
      ok: true as const,
      download_url: report.path,
    };
  },
});

export const sendResearchDeliveryEmail = internalAction({
  args: {
    recipient_email: v.string(),
    recipient_name: v.string(),
    report_title: v.string(),
    report_subtitle: v.string(),
    download_url: v.string(),
  },
  handler: async (_ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || !args.recipient_email) {
      return;
    }

    const email = researchDeliveryEmail({
      recipientName: args.recipient_name,
      reportTitle: args.report_title,
      reportSubtitle: args.report_subtitle,
      downloadUrl: args.download_url,
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Orbys360 Research <noreply@orbys360.com>",
        to: args.recipient_email,
        subject: email.subject,
        html: email.html,
      }),
    });
  },
});
