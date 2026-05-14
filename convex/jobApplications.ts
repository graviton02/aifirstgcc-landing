import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { appError } from "./lib/errors";
import {
  APPLICATION_STATUSES,
  canApplyToJob,
  isPdfResumeFile,
  isValidLinkedInUrl,
  normalizeLinkedInUrl,
  RESUME_MAX_SIZE_BYTES,
} from "../src/jobs/config";

async function getMyJobProfile(ctx: any, userId: string) {
  return await ctx.db
    .query("jobProfiles")
    .withIndex("by_clerkUserId", (q: any) => q.eq("clerk_user_id", userId))
    .unique();
}

export const create = mutation({
  args: {
    job_id: v.id("jobs"),
    phone: v.string(),
    current_company: v.optional(v.string()),
    current_title: v.optional(v.string()),
    linkedin_url: v.string(),
    years_of_experience: v.number(),
    cover_note: v.optional(v.string()),
    resume_storage_id: v.string(),
    resume_file_name: v.string(),
    resume_content_type: v.string(),
    resume_size_bytes: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const profile = await getMyJobProfile(ctx, userId);

    if (!profile || profile.role !== "jobseeker") {
      appError("jobseeker_required", "Jobseeker profile required.", 403);
    }

    const job = await ctx.db.get(args.job_id);
    if (!job) {
      appError("job_not_found", "Job not found.", 404);
    }

    if (!canApplyToJob(job)) {
      appError("job_apply_unavailable", "This job is not accepting applications.", 400);
    }

    const existing = await ctx.db
      .query("jobApplications")
      .withIndex("by_jobAndApplicant", (q) =>
        q.eq("job_id", args.job_id).eq("applicant_id", profile._id)
      )
      .unique();

    if (existing) {
      appError("job_application_duplicate", "You have already applied to this job.", 400);
    }

    const phone = args.phone.trim();
    const rawLinkedIn = args.linkedin_url.trim();
    const linkedinUrl = normalizeLinkedInUrl(rawLinkedIn);
    const resumeFileName = args.resume_file_name.trim();
    const resumeContentType = args.resume_content_type.trim().toLowerCase();

    if (!phone) {
      appError("job_application_phone_required", "Phone number is required.", 400);
    }
    if (!rawLinkedIn) {
      appError("job_application_linkedin_required", "LinkedIn URL is required.", 400);
    }
    if (!isValidLinkedInUrl(linkedinUrl)) {
      appError(
        "job_application_linkedin_invalid",
        "LinkedIn URL must look like https://www.linkedin.com/in/your-handle",
        400
      );
    }
    if (args.years_of_experience < 0) {
      appError("job_application_experience_invalid", "Experience cannot be negative.", 400);
    }
    if (args.resume_size_bytes > RESUME_MAX_SIZE_BYTES) {
      appError("job_application_resume_too_large", "Resume must be 5 MB or smaller.", 400);
    }
    if (
      !isPdfResumeFile({
        fileName: resumeFileName,
        contentType: resumeContentType,
      })
    ) {
      appError("job_application_resume_invalid", "Resume must be a PDF.", 400);
    }

    const now = Date.now();
    const applicationId = await ctx.db.insert("jobApplications", {
      job_id: args.job_id,
      applicant_id: profile._id,
      name: profile.name,
      email: profile.email,
      phone,
      ...(args.current_company?.trim() ? { current_company: args.current_company.trim() } : {}),
      ...(args.current_title?.trim() ? { current_title: args.current_title.trim() } : {}),
      linkedin_url: linkedinUrl,
      years_of_experience: args.years_of_experience,
      ...(args.cover_note?.trim() ? { cover_note: args.cover_note.trim() } : {}),
      resume_storage_id: args.resume_storage_id,
      resume_file_name: resumeFileName,
      resume_content_type: resumeContentType,
      resume_size_bytes: args.resume_size_bytes,
      recruiter_status: "new",
      applied_at: now,
      updated_at: now,
    });

    return await ctx.db.get(applicationId);
  },
});

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const profile = await getMyJobProfile(ctx, userId);

    if (!profile || profile.role !== "jobseeker") {
      return [];
    }

    const applications = await ctx.db
      .query("jobApplications")
      .withIndex("by_applicantId", (q) => q.eq("applicant_id", profile._id))
      .collect();

    return await Promise.all(
      applications
        .sort((a: any, b: any) => b.applied_at - a.applied_at)
        .map(async (application: any) => {
          const job = (await ctx.db.get(application.job_id)) as any;
          return {
            ...application,
            job: job
              ? {
                  _id: job._id,
                  slug: job.slug,
                  title: job.title,
                  company_name: job.company_name,
                  status: job.status,
                }
              : null,
          };
        })
    );
  },
});

export const hasApplied = query({
  args: { job_id: v.id("jobs") },
  handler: async (ctx, { job_id }) => {
    const userId = await requireAuth(ctx);
    const profile = await getMyJobProfile(ctx, userId);

    if (!profile || profile.role !== "jobseeker") {
      return false;
    }

    const existing = await ctx.db
      .query("jobApplications")
      .withIndex("by_jobAndApplicant", (q) =>
        q.eq("job_id", job_id).eq("applicant_id", profile._id)
      )
      .unique();

    return !!existing;
  },
});

export const updateRecruiterStatus = mutation({
  args: {
    application_id: v.id("jobApplications"),
    recruiter_status: v.union(
      ...APPLICATION_STATUSES.map((status) => v.literal(status))
    ),
  },
  handler: async (ctx, { application_id, recruiter_status }) => {
    const userId = await requireAuth(ctx);
    const profile = await getMyJobProfile(ctx, userId);

    if (!profile || profile.role !== "recruiter") {
      appError("job_recruiter_required", "Recruiter profile required.", 403);
    }

    const application = await ctx.db.get(application_id);
    if (!application) {
      appError("job_application_not_found", "Application not found.", 404);
    }

    const job = await ctx.db.get(application.job_id);
    if (!job || job.recruiter_id !== profile._id) {
      appError("job_application_forbidden", "You cannot update this application.", 403);
    }

    await ctx.db.patch(application_id, {
      recruiter_status,
      updated_at: Date.now(),
    });
  },
});
