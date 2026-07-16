// Shared config for the AI Advisor program sign-up flow.
// Imported by both the client form and the Convex validation layer
// (mirrors the src/jobs/config convention).

export const ADVISOR_EXPERTISE_AREAS = [
  "AI Strategy",
  "ML / GenAI Engineering Leadership",
  "Data Platforms",
  "AI Governance & Risk",
  "MLOps & Infrastructure",
  "Applied Research",
] as const;

export type AdvisorExpertiseArea = (typeof ADVISOR_EXPERTISE_AREAS)[number];

export const ADVISOR_EXPERIENCE_LEVELS = [
  "3-5 years",
  "6-10 years",
  "11-15 years",
  "15+ years",
] as const;

export type AdvisorExperienceLevel = (typeof ADVISOR_EXPERIENCE_LEVELS)[number];

export const ADVISOR_BIO_MAX_LENGTH = 400;
export const ADVISOR_BIO_MIN_LENGTH = 20;
