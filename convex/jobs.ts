import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { appError } from "./lib/errors";
import { requireAuth } from "./lib/auth";
import {
  buildJobSearchText,
  canApplyToJob,
  canPubliclyViewJob,
  isJobCategory,
  isJobExpired,
  isJobSeniority,
  isJobType,
  isJobWorkplaceType,
  isSalaryType,
  JOBS_PAGE_SIZE,
  type JobCategory,
  type JobSeniority,
  type JobType,
  type JobWorkplaceType,
  type SalaryType,
  slugifyJobTitle,
} from "../src/jobs/config";

async function getMyJobProfile(ctx: any, userId: string) {
  return await ctx.db
    .query("jobProfiles")
    .withIndex("by_clerkUserId", (q: any) => q.eq("clerk_user_id", userId))
    .unique();
}

async function getUniqueJobSlug(
  ctx: { db: any },
  title: string
) {
  const baseSlug = slugifyJobTitle(title);
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await ctx.db
      .query("jobs")
      .withIndex("by_slug", (q: any) => q.eq("slug", candidate))
      .unique();

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function getStorageUrlOrNull(ctx: any, storageId: string) {
  try {
    return await ctx.storage.getUrl(storageId as any);
  } catch {
    return null;
  }
}

function normalizeOptionalString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function validateJobInput(args: {
  title: string;
  company_name: string;
  location: string;
  workplace_type: string;
  job_type: string;
  seniority: string;
  category: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_type?: string;
  salary_currency?: string;
  num_openings?: number;
  apply_url?: string;
  deadline?: number;
}) {
  if (!isJobWorkplaceType(args.workplace_type)) {
    appError("job_workplace_type_invalid", "Invalid workplace type.", 400);
  }
  if (!isJobType(args.job_type)) {
    appError("job_type_invalid", "Invalid job type.", 400);
  }
  if (!isJobSeniority(args.seniority)) {
    appError("job_seniority_invalid", "Invalid seniority.", 400);
  }
  if (!isJobCategory(args.category)) {
    appError("job_category_invalid", "Invalid job category.", 400);
  }
  if (!args.title.trim() || !args.company_name.trim() || !args.location.trim() || !args.description.trim()) {
    appError("job_fields_required", "Title, company, location, and description are required.", 400);
  }
  const hasSalary =
    typeof args.salary_min === "number" ||
    typeof args.salary_max === "number" ||
    Boolean(args.salary_type) ||
    Boolean(args.salary_currency);
  if (hasSalary) {
    if (
      typeof args.salary_min !== "number" ||
      typeof args.salary_max !== "number" ||
      !isSalaryType(args.salary_type) ||
      !args.salary_currency?.trim()
    ) {
      appError(
        "job_salary_incomplete",
        "Salary range, salary type, and salary currency must all be provided together.",
        400
      );
    }
    if (args.salary_min > args.salary_max) {
      appError("job_salary_invalid", "Salary minimum cannot be greater than salary maximum.", 400);
    }
  }
  if (typeof args.num_openings === "number" && args.num_openings < 1) {
    appError("job_openings_invalid", "Openings must be at least 1.", 400);
  }
  if (typeof args.deadline === "number" && args.deadline <= Date.now()) {
    appError("job_deadline_invalid", "Deadline must be in the future.", 400);
  }
}

async function hydrateJobWithApplicants(ctx: any, job: any) {
  const applications = await ctx.db
    .query("jobApplications")
    .withIndex("by_jobId", (q: any) => q.eq("job_id", job._id))
    .collect();

  const applicants = await Promise.all(
    applications
      .sort((a: any, b: any) => b.applied_at - a.applied_at)
      .map(async (application: any) => ({
        ...application,
        resume_url: await getStorageUrlOrNull(ctx, application.resume_storage_id),
      }))
  );

  return {
    ...job,
    applicants,
    applicant_count: applicants.length,
    is_expired: isJobExpired(job.deadline),
  };
}

export const listPublic = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    workplace_type: v.optional(v.string()),
    job_type: v.optional(v.string()),
    seniority: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = Math.max(1, args.page ?? 1);
    const pageSize = Math.max(1, Math.min(24, args.pageSize ?? JOBS_PAGE_SIZE));
    const search = normalizeOptionalString(args.search)?.toLowerCase();
    const category = normalizeOptionalString(args.category);
    const workplaceType = normalizeOptionalString(args.workplace_type);
    const jobType = normalizeOptionalString(args.job_type);
    const seniority = normalizeOptionalString(args.seniority);

    let jobs: any[];

    if (search) {
      const limit = page * pageSize * 5;
      jobs = await ctx.db
        .query("jobs")
        .withSearchIndex("search_jobs", (q) => {
          let sq = q.search("search_text", search).eq("status", "approved");
          if (category && isJobCategory(category)) sq = sq.eq("category", category);
          if (workplaceType && isJobWorkplaceType(workplaceType)) sq = sq.eq("workplace_type", workplaceType);
          if (jobType && isJobType(jobType)) sq = sq.eq("job_type", jobType);
          if (seniority && isJobSeniority(seniority)) sq = sq.eq("seniority", seniority);
          return sq;
        })
        .take(limit);
    } else {
      jobs = await ctx.db
        .query("jobs")
        .withIndex("by_status_created", (q) => q.eq("status", "approved"))
        .collect();
    }

    const filtered = jobs
      .filter((job) => {
        if (category && job.category !== category) return false;
        if (workplaceType && job.workplace_type !== workplaceType) return false;
        if (jobType && job.job_type !== jobType) return false;
        if (seniority && job.seniority !== seniority) return false;
        return true;
      })
      .sort((a, b) => b.created_at - a.created_at);

    const start = (page - 1) * pageSize;
    const pageData = filtered.slice(start, start + pageSize).map((job) => ({
      ...job,
      is_expired: isJobExpired(job.deadline),
      can_apply: canApplyToJob(job),
    }));

    return {
      data: pageData,
      count: filtered.length,
      page,
      pageSize,
      hasMore: start + pageSize < filtered.length,
    };
  },
});

export const getPublicBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const job = await ctx.db
      .query("jobs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!job || !canPubliclyViewJob(job.status)) {
      return null;
    }

    return {
      ...job,
      is_expired: isJobExpired(job.deadline),
      can_apply: canApplyToJob(job),
    };
  },
});

export const getRecruiterDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const profile = await getMyJobProfile(ctx, userId);

    if (!profile || profile.role !== "recruiter") {
      return [];
    }

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_recruiterId", (q) => q.eq("recruiter_id", profile._id))
      .collect();

    const hydrated = await Promise.all(
      jobs
        .sort((a: any, b: any) => b.created_at - a.created_at)
        .map((job: any) => hydrateJobWithApplicants(ctx, job))
    );

    return hydrated;
  },
});

export const getMineBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const userId = await requireAuth(ctx);
    const profile = await getMyJobProfile(ctx, userId);

    if (!profile || profile.role !== "recruiter") {
      return null;
    }

    const job = await ctx.db
      .query("jobs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!job || job.recruiter_id !== profile._id) {
      return null;
    }

    return await hydrateJobWithApplicants(ctx, job);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    company_name: v.string(),
    location: v.string(),
    workplace_type: v.string(),
    job_type: v.string(),
    seniority: v.string(),
    category: v.string(),
    description: v.string(),
    requirements: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    salary_min: v.optional(v.number()),
    salary_max: v.optional(v.number()),
    salary_type: v.optional(v.string()),
    salary_currency: v.optional(v.string()),
    num_openings: v.optional(v.number()),
    apply_url: v.optional(v.string()),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const profile = await getMyJobProfile(ctx, userId);

    if (!profile || profile.role !== "recruiter") {
      appError("job_recruiter_required", "Recruiter profile required.", 403);
    }

    validateJobInput(args);

    const title = args.title.trim();
    const companyName = args.company_name.trim();
    const location = args.location.trim();
    const description = args.description.trim();
    const requirements = normalizeOptionalString(args.requirements);
    const skills = (args.skills ?? [])
      .map((skill) => skill.trim())
      .filter(Boolean);
    const applyUrl = normalizeOptionalString(args.apply_url);
    const salaryCurrency = normalizeOptionalString(args.salary_currency)?.toUpperCase();
    const workplaceType = args.workplace_type as JobWorkplaceType;
    const jobType = args.job_type as JobType;
    const seniority = args.seniority as JobSeniority;
    const category = args.category as JobCategory;
    const salaryType = args.salary_type as SalaryType | undefined;

    const slug = await getUniqueJobSlug(ctx, title);
    const createdAt = Date.now();
    const jobId = await ctx.db.insert("jobs", {
      slug,
      recruiter_id: profile._id,
      title,
      company_name: companyName,
      location,
      workplace_type: workplaceType,
      job_type: jobType,
      seniority,
      category,
      description,
      ...(requirements ? { requirements } : {}),
      ...(skills.length > 0 ? { skills } : {}),
      ...(typeof args.salary_min === "number" ? { salary_min: args.salary_min } : {}),
      ...(typeof args.salary_max === "number" ? { salary_max: args.salary_max } : {}),
      ...(salaryType ? { salary_type: salaryType } : {}),
      ...(salaryCurrency ? { salary_currency: salaryCurrency } : {}),
      ...(typeof args.num_openings === "number" ? { num_openings: args.num_openings } : {}),
      ...(applyUrl ? { apply_url: applyUrl } : {}),
      ...(typeof args.deadline === "number" ? { deadline: args.deadline } : {}),
      status: "pending",
      search_text: buildJobSearchText({
        title,
        company_name: companyName,
        location,
        category,
        workplace_type: workplaceType,
        job_type: jobType,
        seniority,
        description,
        requirements,
        skills,
      }),
      created_at: createdAt,
      updated_at: createdAt,
    });

    return await ctx.db.get(jobId);
  },
});

export const closeMine = mutation({
  args: {
    job_id: v.id("jobs"),
  },
  handler: async (ctx, { job_id }) => {
    const userId = await requireAuth(ctx);
    const profile = await getMyJobProfile(ctx, userId);

    if (!profile || profile.role !== "recruiter") {
      appError("job_recruiter_required", "Recruiter profile required.", 403);
    }

    const job = await ctx.db.get(job_id);
    if (!job || job.recruiter_id !== profile._id) {
      appError("job_not_found", "Job not found.", 404);
    }

    if (job.status !== "approved") {
      appError("job_close_invalid", "Only approved jobs can be closed.", 400);
    }

    await ctx.db.patch(job_id, {
      status: "closed",
      closed_at: Date.now(),
      updated_at: Date.now(),
    });
  },
});

export const seedSampleJob = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if sample job already exists
    const existing = await ctx.db
      .query("jobs")
      .withIndex("by_slug", (q: any) => q.eq("slug", "senior-ai-ml-engineer-gcc-advisory"))
      .unique();
    if (existing) return { jobId: existing._id, skipped: true };

    // Create a recruiter profile for the sample job
    const now = Date.now();
    const profileId = await ctx.db.insert("jobProfiles", {
      clerk_user_id: "seed_recruiter_001",
      role: "recruiter",
      name: "Sarah Al-Rashid",
      email: "sarah@orbys360-demo.com",
      company_name: "Orbys360",
      current_title: "Head of Talent Acquisition",
      created_at: now,
      updated_at: now,
    });

    const title = "Senior AI/ML Engineer — GCC Advisory Platform";
    const companyName = "Orbys360";
    const location = "Riyadh, Saudi Arabia";
    const category = "ai-ml" as const;
    const workplaceType = "hybrid" as const;
    const jobType = "full-time" as const;
    const seniority = "senior" as const;

    const description = `We're looking for a Senior AI/ML Engineer to join Orbys360's core platform team in Riyadh. You'll design and ship production ML systems that power our AI agent directory — from recommendation engines that match GCC enterprises with the right AI solutions, to NLP pipelines that extract structured intelligence from vendor data.

**What you'll do:**
- Build and deploy ML models for agent recommendation, search ranking, and content classification
- Design data pipelines that ingest, normalize, and enrich AI vendor and agent data across the GCC ecosystem
- Collaborate with product and design to ship user-facing AI features (smart search, automated comparisons, intent matching)
- Own model lifecycle: training, evaluation, A/B testing, monitoring, and iteration
- Contribute to platform architecture decisions as we scale from hundreds to thousands of AI agents

**What makes this role unique:**
You'll work at the intersection of AI and the GCC's digital transformation. The advisory tools you build will directly influence how enterprises across Saudi Arabia, UAE, and the broader region adopt AI — a market undergoing rapid, government-backed modernization.`;

    const requirements = `- 5+ years in ML/AI engineering with production deployment experience
- Strong Python (PyTorch or TensorFlow) and TypeScript
- Experience with NLP, recommendation systems, or search ranking
- Familiarity with cloud infrastructure (AWS, GCP, or Azure)
- Experience with vector databases (Pinecone, Weaviate, or similar)
- Prior work in marketplace, directory, or platform products is a strong plus
- Understanding of the GCC tech ecosystem is a bonus but not required`;

    const skills = [
      "Python",
      "TypeScript",
      "PyTorch",
      "TensorFlow",
      "NLP",
      "Vector Databases",
      "AWS",
      "Recommendation Systems",
      "MLOps",
      "Next.js",
    ];

    const searchText = buildJobSearchText({
      title,
      company_name: companyName,
      location,
      category,
      workplace_type: workplaceType,
      job_type: jobType,
      seniority,
      description,
      requirements,
      skills,
    });

    const jobId = await ctx.db.insert("jobs", {
      slug: "senior-ai-ml-engineer-gcc-advisory",
      recruiter_id: profileId,
      title,
      company_name: companyName,
      location,
      workplace_type: workplaceType,
      job_type: jobType,
      seniority,
      category,
      description,
      requirements,
      skills,
      salary_min: 45000,
      salary_max: 65000,
      salary_type: "monthly",
      salary_currency: "SAR",
      num_openings: 2,
      deadline: now + 60 * 24 * 60 * 60 * 1000, // 60 days from now
      status: "approved",
      search_text: searchText,
      created_at: now,
      updated_at: now,
    });

    return { jobId, skipped: false };
  },
});

const DEMO_JOB_SLUG = "senior-ai-ml-engineer-orbys360-demo";

export const generateDemoResumeUploadUrl = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const seedJobBoardDemo = internalMutation({
  args: {
    recruiterClerkId: v.string(),
    recruiterEmail: v.string(),
    recruiterName: v.string(),
    candidateClerkId: v.string(),
    candidateEmail: v.string(),
    candidateName: v.string(),
    resumeStorageId: v.string(),
    resumeSizeBytes: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const recruiterProfile = await getMyJobProfile(ctx, args.recruiterClerkId);
    let recruiterProfileId = recruiterProfile?._id;
    if (!recruiterProfileId) {
      recruiterProfileId = await ctx.db.insert("jobProfiles", {
        clerk_user_id: args.recruiterClerkId,
        role: "recruiter",
        name: args.recruiterName,
        email: args.recruiterEmail,
        company_name: "Orbys360",
        current_title: "Head of Talent Acquisition",
        linkedin_url: "https://www.linkedin.com/in/sarah-alrashid-demo/",
        phone: "+966 50 555 0100",
        created_at: now,
        updated_at: now,
      });
    }

    const candidateProfile = await getMyJobProfile(ctx, args.candidateClerkId);
    let candidateProfileId = candidateProfile?._id;
    if (!candidateProfileId) {
      candidateProfileId = await ctx.db.insert("jobProfiles", {
        clerk_user_id: args.candidateClerkId,
        role: "jobseeker",
        name: args.candidateName,
        email: args.candidateEmail,
        company_name: undefined,
        current_title: "ML Engineer",
        linkedin_url: "https://www.linkedin.com/in/ahmed-hassan-demo/",
        phone: "+966 50 555 0200",
        created_at: now,
        updated_at: now,
      });
    }

    let job = await ctx.db
      .query("jobs")
      .withIndex("by_slug", (q: any) => q.eq("slug", DEMO_JOB_SLUG))
      .unique();

    if (!job) {
      const title = "Senior AI/ML Engineer — GCC Advisory Platform";
      const companyName = "Orbys360";
      const location = "Riyadh, Saudi Arabia";
      const category = "ai-ml" as const;
      const workplaceType = "hybrid" as const;
      const jobType = "full-time" as const;
      const seniority = "senior" as const;

      const description = `We're looking for a Senior AI/ML Engineer to join Orbys360's core platform team in Riyadh. You'll design and ship production ML systems that power our AI agent directory — from recommendation engines that match GCC enterprises with the right AI solutions, to NLP pipelines that extract structured intelligence from vendor data.

**What you'll do:**
- Build and deploy ML models for agent recommendation, search ranking, and content classification
- Design data pipelines that ingest, normalize, and enrich AI vendor and agent data across the GCC ecosystem
- Collaborate with product and design to ship user-facing AI features (smart search, automated comparisons, intent matching)
- Own model lifecycle: training, evaluation, A/B testing, monitoring, and iteration
- Contribute to platform architecture decisions as we scale from hundreds to thousands of AI agents

**What makes this role unique:**
You'll work at the intersection of AI and the GCC's digital transformation. The advisory tools you build will directly influence how enterprises across Saudi Arabia, UAE, and the broader region adopt AI — a market undergoing rapid, government-backed modernization.`;

      const requirements = `- 5+ years in ML/AI engineering with production deployment experience
- Strong Python (PyTorch or TensorFlow) and TypeScript
- Experience with NLP, recommendation systems, or search ranking
- Familiarity with cloud infrastructure (AWS, GCP, or Azure)
- Experience with vector databases (Pinecone, Weaviate, or similar)
- Prior work in marketplace, directory, or platform products is a strong plus
- Understanding of the GCC tech ecosystem is a bonus but not required`;

      const skills = [
        "Python",
        "TypeScript",
        "PyTorch",
        "TensorFlow",
        "NLP",
        "Vector Databases",
        "AWS",
        "Recommendation Systems",
        "MLOps",
        "Next.js",
      ];

      const searchText = buildJobSearchText({
        title,
        company_name: companyName,
        location,
        category,
        workplace_type: workplaceType,
        job_type: jobType,
        seniority,
        description,
        requirements,
        skills,
      });

      const jobId = await ctx.db.insert("jobs", {
        slug: DEMO_JOB_SLUG,
        recruiter_id: recruiterProfileId,
        title,
        company_name: companyName,
        location,
        workplace_type: workplaceType,
        job_type: jobType,
        seniority,
        category,
        description,
        requirements,
        skills,
        salary_min: 45000,
        salary_max: 65000,
        salary_type: "monthly",
        salary_currency: "SAR",
        num_openings: 2,
        deadline: now + 60 * 24 * 60 * 60 * 1000,
        status: "approved",
        reviewed_at: now,
        search_text: searchText,
        created_at: now,
        updated_at: now,
      });
      job = await ctx.db.get(jobId);
    }

    const existingApplication = await ctx.db
      .query("jobApplications")
      .withIndex("by_jobAndApplicant", (q: any) =>
        q.eq("job_id", job!._id).eq("applicant_id", candidateProfileId!)
      )
      .unique();

    let applicationId = existingApplication?._id;
    if (!applicationId) {
      applicationId = await ctx.db.insert("jobApplications", {
        job_id: job!._id,
        applicant_id: candidateProfileId,
        name: args.candidateName,
        email: args.candidateEmail,
        phone: "+966 50 555 0200",
        current_company: "TechCorp Riyadh",
        current_title: "ML Engineer",
        linkedin_url: "https://www.linkedin.com/in/ahmed-hassan-demo/",
        years_of_experience: 4,
        cover_note:
          "I've spent the last four years shipping recommendation and ranking systems at TechCorp Riyadh, and I'm excited about the GCC-focused mission at Orbys360. My recent work on Arabic-language NLP pipelines and multi-tenant ML infrastructure feels like a strong match for the platform's roadmap. Would love to chat about how I can contribute to your agent matching engine.",
        resume_storage_id: args.resumeStorageId,
        resume_file_name: "ahmed-hassan-resume.pdf",
        resume_content_type: "application/pdf",
        resume_size_bytes: args.resumeSizeBytes,
        recruiter_status: "new",
        applied_at: now,
        updated_at: now,
      });
    }

    return {
      recruiterProfileId,
      candidateProfileId,
      jobId: job!._id,
      jobSlug: DEMO_JOB_SLUG,
      applicationId,
    };
  },
});

export const cleanupJobBoardDemo = internalMutation({
  args: {
    recruiterClerkId: v.string(),
    candidateClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const recruiterProfile = await getMyJobProfile(ctx, args.recruiterClerkId);
    const candidateProfile = await getMyJobProfile(ctx, args.candidateClerkId);

    const job = await ctx.db
      .query("jobs")
      .withIndex("by_slug", (q: any) => q.eq("slug", DEMO_JOB_SLUG))
      .unique();

    let deletedApplications = 0;
    if (job) {
      const applications = await ctx.db
        .query("jobApplications")
        .withIndex("by_jobId", (q: any) => q.eq("job_id", job._id))
        .collect();
      for (const application of applications) {
        await ctx.db.delete(application._id);
        deletedApplications++;
      }
      await ctx.db.delete(job._id);
    }

    if (recruiterProfile) await ctx.db.delete(recruiterProfile._id);
    if (candidateProfile) await ctx.db.delete(candidateProfile._id);

    return {
      deletedJob: Boolean(job),
      deletedApplications,
      deletedRecruiterProfile: Boolean(recruiterProfile),
      deletedCandidateProfile: Boolean(candidateProfile),
    };
  },
});

const ORBIS360_RECRUITER_JOB_SLUGS = [
  "ai-advisor-orbys360",
  "ai-architect-orbys360",
  "gtm-manager-orbys360",
] as const;

const ORBIS360_RECRUITER_JOBS = [
  {
    slug: "ai-advisor-orbys360",
    title: "AI Advisor",
    category: "ai-ml" as const,
    seniority: "senior" as const,
    description: `Orbys360 is onboarding experienced AI advisors who want to increase their visibility with enterprises evaluating practical AI adoption. As an AI Advisor on the Orbys360 platform, you will help business leaders understand where AI can create measurable value, shape advisory conversations, and guide organizations from early exploration to clear solution direction.

This role is designed for advisors who can combine strategic thinking with practical AI fluency. You will contribute to platform-led advisory offerings, support enterprise discovery calls, publish perspectives that help buyers make better AI decisions, and help Orbys360 match demand with the right experts, providers, and implementation paths.

Responsibilities:
- Join the Orbys360 advisor network and build visibility with enterprise AI buyers through the platform
- Lead discovery conversations with leaders exploring AI use cases, operating-model changes, and vendor options
- Translate business priorities into practical AI opportunity maps, adoption roadmaps, and solution recommendations
- Contribute advisory content, viewpoints, and structured insights that strengthen the platform's knowledge layer
- Collaborate with AI architects, providers, and GTM teams to shape credible recommendations for enterprise clients
- Help refine Orbys360's advisory playbooks based on real buyer questions, objections, and implementation patterns`,
    requirements: `- Experience in AI strategy, digital transformation, management consulting, or enterprise technology advisory
- Strong ability to translate ambiguous business problems into clear AI opportunities and next steps
- Comfortable advising CXO, business, product, operations, and technology stakeholders
- Working knowledge of generative AI, AI agents, automation, data readiness, and responsible AI considerations
- Strong written and verbal communication skills, including executive-ready synthesis
- Familiarity with GCC or enterprise transformation environments is preferred`,
    skills: [
      "AI Strategy",
      "Enterprise Advisory",
      "Generative AI",
      "GCC Transformation",
      "Solution Discovery",
      "Executive Communication",
    ],
  },
  {
    slug: "ai-architect-orbys360",
    title: "AI Architect",
    category: "engineering" as const,
    seniority: "lead" as const,
    description: `Orbys360 is looking for an AI Architect to help translate enterprise AI ambitions into practical, implementation-ready solution blueprints. This role sits at the intersection of advisory, architecture, and technical due diligence, helping clients understand how AI agents, LLM applications, data platforms, and enterprise systems should fit together.

You will evaluate AI solution patterns, define reference architectures, support provider and technology assessment, and partner with advisors to convert business needs into scalable technical designs. The work is ideal for someone who can reason across product, data, cloud, security, integration, and operating-model constraints.

Responsibilities:
- Design AI solution architectures for enterprise use cases across functions and industries
- Evaluate AI agents, platforms, LLM tooling, data dependencies, and integration approaches
- Create reference architectures, implementation roadmaps, and technical decision frameworks
- Partner with AI advisors to convert discovery insights into credible technical recommendations
- Support technical due diligence for providers and solutions listed or recommended through Orbys360
- Identify security, governance, data, and integration risks early in the solution design process`,
    requirements: `- Experience as a solution architect, AI architect, data architect, or senior technical consultant
- Practical understanding of LLMs, agentic systems, RAG, workflow automation, APIs, and enterprise integrations
- Familiarity with cloud architecture, data platforms, identity/security patterns, and production deployment tradeoffs
- Ability to communicate technical architecture clearly to both engineering and executive audiences
- Experience evaluating vendors, platforms, or implementation partners is preferred
- Strong structured thinking and documentation skills`,
    skills: [
      "AI Architecture",
      "LLMs",
      "Agentic Systems",
      "Cloud Architecture",
      "Data Platforms",
      "Enterprise Integration",
    ],
  },
  {
    slug: "gtm-manager-orbys360",
    title: "GTM Manager",
    category: "sales" as const,
    seniority: "mid" as const,
    description: `Orbys360 is hiring a GTM Manager to build and operate the go-to-market motion for an AI advisory and discovery platform serving enterprises, GCCs, advisors, and AI solution providers. You will help create demand, sharpen positioning, activate partnerships, and turn market signals into repeatable campaigns and pipeline.

This role is hands-on and cross-functional. You will work with founders, advisors, providers, and product teams to define buyer segments, create messaging, run campaigns, support sales conversations, and develop the playbooks needed to scale enterprise AI adoption through Orbys360.

Responsibilities:
- Build and execute GTM campaigns for enterprise AI buyers, GCC leaders, advisors, and provider partners
- Refine positioning, messaging, and sales narratives for Orbys360's platform and advisory offerings
- Develop demand-generation experiments across content, events, partnerships, outbound, and community channels
- Manage pipeline inputs, campaign reporting, and feedback loops from sales and advisory conversations
- Partner with advisors and providers to create market-facing content, case narratives, and solution spotlights
- Build sales enablement assets that help explain AI adoption pathways and platform value clearly`,
    requirements: `- Experience in B2B SaaS, enterprise technology, consulting, marketplaces, or AI-related GTM roles
- Strong grasp of positioning, demand generation, partnerships, sales enablement, and pipeline development
- Ability to turn complex AI and enterprise transformation topics into clear market narratives
- Comfortable working in an early-stage, fast-moving environment with high ownership
- Strong writing, stakeholder management, and analytical skills
- Familiarity with AI, automation, GCCs, or enterprise digital transformation is preferred`,
    skills: [
      "GTM Strategy",
      "B2B SaaS",
      "Demand Generation",
      "Partnerships",
      "Sales Enablement",
      "AI Marketplaces",
    ],
  },
] as const;

export const seedOrbis360RecruiterJobs = internalMutation({
  args: {
    recruiterClerkId: v.string(),
    recruiterEmail: v.string(),
    recruiterName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const companyName = "Orbys360";
    const location = "Remote";
    const workplaceType = "remote" as const;
    const jobType = "full-time" as const;

    const existingProfile = await getMyJobProfile(ctx, args.recruiterClerkId);
    if (existingProfile && existingProfile.role !== "recruiter") {
      appError(
        "job_seed_recruiter_role_conflict",
        "Existing job board profile is not a recruiter.",
        400
      );
    }

    const recruiterProfileId =
      existingProfile?._id ??
      (await ctx.db.insert("jobProfiles", {
        clerk_user_id: args.recruiterClerkId,
        role: "recruiter",
        name: args.recruiterName,
        email: args.recruiterEmail.trim().toLowerCase(),
        company_name: companyName,
        current_title: "Recruiter",
        created_at: now,
        updated_at: now,
      }));

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        name: args.recruiterName,
        email: args.recruiterEmail.trim().toLowerCase(),
        company_name: companyName,
        updated_at: now,
      });
    }

    const jobs = [];
    for (const job of ORBIS360_RECRUITER_JOBS) {
      const existingJob = await ctx.db
        .query("jobs")
        .withIndex("by_slug", (q: any) => q.eq("slug", job.slug))
        .unique();

      if (existingJob) {
        jobs.push({ slug: job.slug, jobId: existingJob._id, skipped: true });
        continue;
      }

      const searchText = buildJobSearchText({
        title: job.title,
        company_name: companyName,
        location,
        category: job.category,
        workplace_type: workplaceType,
        job_type: jobType,
        seniority: job.seniority,
        description: job.description,
        requirements: job.requirements,
        skills: job.skills,
      });

      const jobId = await ctx.db.insert("jobs", {
        slug: job.slug,
        recruiter_id: recruiterProfileId,
        title: job.title,
        company_name: companyName,
        location,
        workplace_type: workplaceType,
        job_type: jobType,
        seniority: job.seniority,
        category: job.category,
        description: job.description,
        requirements: job.requirements,
        skills: [...job.skills],
        num_openings: 1,
        status: "approved",
        reviewed_at: now,
        search_text: searchText,
        created_at: now,
        updated_at: now,
      });
      jobs.push({ slug: job.slug, jobId, skipped: false });
    }

    return {
      recruiterProfileId,
      slugs: [...ORBIS360_RECRUITER_JOB_SLUGS],
      jobs,
    };
  },
});
