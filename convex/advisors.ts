import { mutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { appError } from "./lib/errors";
import { advisorConfirmationEmail } from "./emails/advisorConfirmation";
import {
  ADVISOR_EXPERTISE_AREAS,
  ADVISOR_EXPERIENCE_LEVELS,
  ADVISOR_BIO_MAX_LENGTH,
  ADVISOR_BIO_MIN_LENGTH,
} from "../src/advisors/config";

const EXPERTISE_SET = new Set<string>(ADVISOR_EXPERTISE_AREAS);
const EXPERIENCE_SET = new Set<string>(ADVISOR_EXPERIENCE_LEVELS);

// Deliberately NO free-email-provider block here: independent consultants
// legitimately apply with personal email addresses.
const LINKEDIN_URL_PATTERN = /^https?:\/\/([a-z0-9-]+\.)*linkedin\.com\/.+/i;

function shouldScheduleEmails() {
  return process.env.NODE_ENV !== "test" && !process.env.VITEST;
}

export const submitAdvisorApplication = mutation({
  args: {
    full_name: v.string(),
    email: v.string(),
    linkedin_url: v.string(),
    headline: v.string(),
    years_experience: v.string(),
    expertise_areas: v.array(v.string()),
    bio: v.string(),
    consent: v.boolean(),
    user_agent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fullName = args.full_name.trim();
    if (fullName.length < 2) {
      appError("advisor_name_short", "Please enter your full name.", 400);
    }

    const email = args.email.trim().toLowerCase();
    if (!email.includes("@") || !email.includes(".")) {
      appError("advisor_email_invalid", "Please enter a valid email address.", 400);
    }

    const linkedinUrl = args.linkedin_url.trim();
    if (!LINKEDIN_URL_PATTERN.test(linkedinUrl)) {
      appError(
        "advisor_linkedin_invalid",
        "Please enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/your-name).",
        400
      );
    }

    const headline = args.headline.trim();
    if (headline.length < 2) {
      appError("advisor_headline_required", "Please enter your current role or headline.", 400);
    }

    const yearsExperience = args.years_experience.trim();
    if (!EXPERIENCE_SET.has(yearsExperience)) {
      appError("advisor_experience_invalid", "Please select your years of experience.", 400);
    }

    const expertiseAreas = Array.from(
      new Set(args.expertise_areas.map((area) => area.trim()).filter(Boolean))
    );
    if (expertiseAreas.length === 0) {
      appError("advisor_expertise_required", "Please select at least one expertise area.", 400);
    }
    if (expertiseAreas.some((area) => !EXPERTISE_SET.has(area))) {
      appError("advisor_expertise_invalid", "One or more expertise areas are not recognised.", 400);
    }

    const bio = args.bio.trim();
    if (bio.length < ADVISOR_BIO_MIN_LENGTH) {
      appError(
        "advisor_bio_short",
        `Please write a short bio of at least ${ADVISOR_BIO_MIN_LENGTH} characters.`,
        400
      );
    }
    if (bio.length > ADVISOR_BIO_MAX_LENGTH) {
      appError(
        "advisor_bio_long",
        `Please keep your bio under ${ADVISOR_BIO_MAX_LENGTH} characters.`,
        400
      );
    }

    if (args.consent !== true) {
      appError(
        "advisor_consent_required",
        "Please confirm you consent to a public advisor profile listing.",
        400
      );
    }

    // Dedupe by email — one application per practitioner.
    const existing = await ctx.db
      .query("advisorSubmissions")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      appError(
        "advisor_already_applied",
        "We already have an application from this email address. We'll be in touch soon.",
        409
      );
    }

    const now = Date.now();
    await ctx.db.insert("advisorSubmissions", {
      full_name: fullName,
      email,
      linkedin_url: linkedinUrl,
      headline,
      years_experience: yearsExperience,
      expertise_areas: expertiseAreas,
      bio,
      consent: true,
      user_agent: args.user_agent,
      status: "pending",
      created_at: now,
      updated_at: now,
    });

    if (shouldScheduleEmails()) {
      try {
        await ctx.scheduler.runAfter(0, internal.advisors.sendAdvisorConfirmationEmail, {
          recipient_email: email,
          recipient_name: fullName,
        });
      } catch (error) {
        console.error("Failed to schedule advisor confirmation email", {
          email,
          error,
        });
      }
    }

    return { ok: true as const };
  },
});

export const sendAdvisorConfirmationEmail = internalAction({
  args: {
    recipient_email: v.string(),
    recipient_name: v.string(),
  },
  handler: async (_ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || !args.recipient_email) {
      return;
    }

    const email = advisorConfirmationEmail({
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
