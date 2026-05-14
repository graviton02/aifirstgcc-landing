import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { appError } from "./lib/errors";
import { JOB_BOARD_ROLES } from "../src/jobs/config";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return await ctx.db
      .query("jobProfiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerk_user_id", userId))
      .unique();
  },
});

export const createProfile = mutation({
  args: {
    role: v.union(...JOB_BOARD_ROLES.map((role) => v.literal(role))),
    name: v.string(),
    email: v.string(),
    company_name: v.optional(v.string()),
    current_title: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query("jobProfiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerk_user_id", userId))
      .unique();

    if (existing) {
      appError("job_profile_exists", "You already have a job board profile.", 400);
    }

    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const companyName = args.company_name?.trim();
    const currentTitle = args.current_title?.trim();
    const linkedinUrl = args.linkedin_url?.trim();
    const phone = args.phone?.trim();

    if (!name || !email) {
      appError("job_profile_invalid", "Name and email are required.", 400);
    }

    if (args.role === "recruiter" && !companyName) {
      appError("job_profile_company_required", "Company name is required.", 400);
    }

    if (args.role === "jobseeker" && !currentTitle) {
      appError("job_profile_title_required", "Current title is required.", 400);
    }

    const now = Date.now();
    const profileId = await ctx.db.insert("jobProfiles", {
      clerk_user_id: userId,
      role: args.role,
      name,
      email,
      ...(companyName ? { company_name: companyName } : {}),
      ...(currentTitle ? { current_title: currentTitle } : {}),
      ...(linkedinUrl ? { linkedin_url: linkedinUrl } : {}),
      ...(phone ? { phone } : {}),
      created_at: now,
      updated_at: now,
    });

    return await ctx.db.get(profileId);
  },
});
