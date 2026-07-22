import { mutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { appError } from "./lib/errors";
import { candidateConfirmationEmail } from "./emails/candidateConfirmation";
import { CANDIDATE_LEAD_DEFAULT_SOURCE } from "../src/jobs/config";

function shouldScheduleEmails() {
  return process.env.NODE_ENV !== "test" && !process.env.VITEST;
}

/**
 * Public, unauthenticated interest capture for the job board. Candidates who
 * submit here do not get an account — the leads are exported from the admin
 * dashboard and mailed manually when a matching role opens.
 */
export const submitCandidateLead = mutation({
  args: {
    full_name: v.string(),
    email: v.string(),
    source: v.optional(v.string()),
    user_agent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fullName = args.full_name.trim();
    if (fullName.length < 2) {
      appError("candidate_name_short", "Please enter your full name.", 400);
    }

    const email = args.email.trim().toLowerCase();
    if (!email.includes("@") || !email.includes(".")) {
      appError("candidate_email_invalid", "Please enter a valid email address.", 400);
    }

    const now = Date.now();

    // A returning campaign visitor resubmitting is expected, not an error —
    // refresh the timestamp and tell the client they're already on the list.
    const existing = await ctx.db
      .query("candidateLeads")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { updated_at: now });
      return { ok: true as const, alreadyRegistered: true as const };
    }

    await ctx.db.insert("candidateLeads", {
      full_name: fullName,
      email,
      source: args.source?.trim() || CANDIDATE_LEAD_DEFAULT_SOURCE,
      user_agent: args.user_agent,
      status: "new",
      created_at: now,
      updated_at: now,
    });

    if (shouldScheduleEmails()) {
      try {
        await ctx.scheduler.runAfter(
          0,
          internal.candidateLeads.sendCandidateConfirmationEmail,
          { recipient_email: email, recipient_name: fullName }
        );
      } catch (error) {
        console.error("Failed to schedule candidate confirmation email", {
          email,
          error,
        });
      }
    }

    return { ok: true as const, alreadyRegistered: false as const };
  },
});

export const sendCandidateConfirmationEmail = internalAction({
  args: {
    recipient_email: v.string(),
    recipient_name: v.string(),
  },
  handler: async (_ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || !args.recipient_email) {
      return;
    }

    const email = candidateConfirmationEmail({
      recipientName: args.recipient_name,
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
  },
});
