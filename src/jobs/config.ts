export const JOB_BOARD_ROLES = ["recruiter", "jobseeker"] as const;
export type JobBoardRole = (typeof JOB_BOARD_ROLES)[number];

export const JOB_WORKPLACE_TYPES = ["remote", "hybrid", "onsite"] as const;
export type JobWorkplaceType = (typeof JOB_WORKPLACE_TYPES)[number];

export const JOB_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship",
] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const JOB_SENIORITY_LEVELS = [
  "entry",
  "mid",
  "senior",
  "lead",
  "executive",
] as const;
export type JobSeniority = (typeof JOB_SENIORITY_LEVELS)[number];

export const JOB_CATEGORIES = [
  "engineering",
  "data-science",
  "product",
  "ai-ml",
  "operations",
  "sales",
  "other",
] as const;
export type JobCategory = (typeof JOB_CATEGORIES)[number];

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  engineering: "Engineering",
  "data-science": "Data Science",
  product: "Product",
  "ai-ml": "AI / ML",
  operations: "Operations",
  sales: "Sales",
  other: "Other",
};

export const JOB_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "closed",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const APPLICATION_STATUSES = [
  "new",
  "reviewed",
  "shortlisted",
  "rejected",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const SALARY_TYPES = ["annual", "monthly"] as const;
export type SalaryType = (typeof SALARY_TYPES)[number];

export const JOBS_PAGE_SIZE = 12;
export const RESUME_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_RESUME_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
]);

export function isJobBoardRole(value: string | null | undefined): value is JobBoardRole {
  return Boolean(value && JOB_BOARD_ROLES.includes(value as JobBoardRole));
}

export function isJobCategory(value: string | null | undefined): value is JobCategory {
  return Boolean(value && JOB_CATEGORIES.includes(value as JobCategory));
}

export function isJobType(value: string | null | undefined): value is JobType {
  return Boolean(value && JOB_TYPES.includes(value as JobType));
}

export function isJobWorkplaceType(
  value: string | null | undefined
): value is JobWorkplaceType {
  return Boolean(value && JOB_WORKPLACE_TYPES.includes(value as JobWorkplaceType));
}

export function isJobSeniority(
  value: string | null | undefined
): value is JobSeniority {
  return Boolean(value && JOB_SENIORITY_LEVELS.includes(value as JobSeniority));
}

export function isSalaryType(value: string | null | undefined): value is SalaryType {
  return Boolean(value && SALARY_TYPES.includes(value as SalaryType));
}

export function slugifyJobTitle(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "job"
  );
}

export function buildJobSearchText(input: {
  title: string;
  company_name: string;
  location: string;
  category: string;
  workplace_type: string;
  job_type: string;
  seniority: string;
  description: string;
  requirements?: string;
  skills?: readonly string[];
}) {
  return [
    input.title,
    input.company_name,
    input.location,
    input.category,
    input.workplace_type,
    input.job_type,
    input.seniority,
    input.description,
    input.requirements ?? "",
    ...(input.skills ?? []),
  ]
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeJobBoardReturnUrl(
  value: string | null | undefined,
  fallback = "/jobs/dashboard"
) {
  if (!value) {
    return fallback;
  }

  try {
    const normalized = new URL(value, "https://orbys360.local");
    if (normalized.origin !== "https://orbys360.local") {
      return fallback;
    }

    const path = `${normalized.pathname}${normalized.search}${normalized.hash}`;
    if (!path.startsWith("/jobs")) {
      return fallback;
    }

    if (path.startsWith("//")) {
      return fallback;
    }

    return path;
  } catch {
    return fallback;
  }
}

export function resolveJobBoardAuthRedirectUrl(
  value: string | null | undefined,
  fallback = "/jobs/dashboard"
) {
  if (!value) {
    return null;
  }

  const returnUrl = sanitizeJobBoardReturnUrl(value, "");
  if (!returnUrl) {
    return null;
  }

  if (returnUrl.startsWith("/jobs/onboarding")) {
    return returnUrl;
  }

  return `/jobs/onboarding?returnUrl=${encodeURIComponent(
    sanitizeJobBoardReturnUrl(returnUrl, fallback)
  )}`;
}

export function isPdfResumeFile({
  fileName,
  contentType,
}: {
  fileName: string;
  contentType?: string | null;
}) {
  const normalizedName = fileName.trim().toLowerCase();
  const normalizedType = contentType?.trim().toLowerCase() ?? "";

  const hasPdfExtension = normalizedName.endsWith(".pdf");
  const hasPdfMime =
    normalizedType.length === 0 || ALLOWED_RESUME_CONTENT_TYPES.has(normalizedType);

  return hasPdfExtension && hasPdfMime;
}

export function isJobExpired(deadline?: number | null, now = Date.now()) {
  return typeof deadline === "number" && deadline < now;
}

export function canPubliclyViewJob(status: JobStatus) {
  return status === "approved";
}

export function canApplyToJob(
  job: {
    status: JobStatus;
    apply_url?: string | null;
    deadline?: number | null;
  },
  now = Date.now()
) {
  return (
    job.status === "approved" &&
    !job.apply_url &&
    !isJobExpired(job.deadline, now)
  );
}
