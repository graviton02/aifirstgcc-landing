import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  APPLICATION_STATUSES,
  JOB_BOARD_ROLES,
  JOB_STATUSES,
  JOB_TYPES,
  JOB_WORKPLACE_TYPES,
  JOB_SENIORITY_LEVELS,
  JOB_CATEGORIES,
  SALARY_TYPES,
} from "../src/jobs/config";

const agentUseCaseValidator = v.object({
  title: v.string(),
  description: v.string(),
});

const initialAgentValidator = v.object({
  agent_name: v.string(),
  tagline: v.optional(v.string()),
  description: v.string(),
  category: v.string(),
  functional_categories: v.array(v.string()),
  industry_categories: v.array(v.string()),
  infrastructure_categories: v.optional(v.array(v.string())),
  use_cases: v.array(agentUseCaseValidator),
  integrations: v.optional(v.array(v.string())),
  expected_outcomes: v.optional(v.array(v.string())),
  source_url: v.optional(v.string()),
  demo_url: v.optional(v.string()),
});

export default defineSchema({
  // --- Early Access ---
  earlyAccessSignups: defineTable({
    email: v.string(),
    created_at: v.number(),
  }).index("by_email", ["email"]),

  // --- Companies (scraped directory entries) ---
  companies: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    website: v.string(),
    headquarters: v.string(),
    founded: v.optional(v.number()),
    company_size: v.optional(v.string()),
    logo_storage_id: v.optional(v.string()),
    logo_url: v.optional(v.string()),
    logo_bg: v.optional(v.string()),
    primary_verticals: v.array(v.string()),
    contact_email: v.optional(v.string()),
    contact_url: v.optional(v.string()),
    clerk_org_id: v.optional(v.string()),
    verification_status: v.union(v.literal("unverified"), v.literal("verified"), v.literal("flagged")),
    claim_status: v.union(v.literal("unclaimed"), v.literal("pending"), v.literal("approved"), v.literal("claimed")),
    claimed_by_user_id: v.optional(v.string()),
    claimed_at: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_clerkOrgId", ["clerk_org_id"])
    .index("by_claimStatus", ["claim_status"])
    .index("by_claimedByUserId", ["claimed_by_user_id"])
    .searchIndex("search_companies", {
      searchField: "name",
      filterFields: ["claim_status"],
    }),

  // --- Claim Requests ---
  claimRequests: defineTable({
    company_id: v.id("companies"),
    claimant_name: v.string(),
    claimant_email: v.string(),
    claimant_linkedin: v.optional(v.string()),
    claimant_user_id: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("activated")
    ),
    admin_notes: v.optional(v.string()),
    reviewed_at: v.optional(v.number()),
    magic_link_token: v.optional(v.string()),
    magic_link_sent_at: v.optional(v.number()),
    magic_link_expires_at: v.optional(v.number()),
    activated_at: v.optional(v.number()),
    created_at: v.number(),
  })
    .index("by_companyId", ["company_id"])
    .index("by_claimantUserId", ["claimant_user_id"])
    .index("by_status", ["status"])
    .index("by_magicLinkToken", ["magic_link_token"]),

  // --- Provider Profiles ---
  providerProfiles: defineTable({
    user_id: v.string(),
    onboarding_path: v.optional(v.union(v.literal("claim_existing"), v.literal("create_new"))),
    // Legacy provider-profile fields preserved for backward compatibility
    // with older deployments that stored provider wizard data here.
    organization_id: v.optional(v.string()),
    company_name: v.optional(v.string()),
    location: v.optional(v.string()),
    company_size: v.optional(v.string()),
    logo_url: v.optional(v.string()),
    website: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_userId", ["user_id"]),

  // --- New Company Submissions ---
  companySubmissions: defineTable({
    user_id: v.string(),
    contact_email: v.string(),
    company_name: v.string(),
    website: v.string(),
    description: v.string(),
    headquarters: v.string(),
    company_size: v.optional(v.string()),
    logo_storage_id: v.optional(v.string()),
    primary_verticals: v.array(v.string()),
    logo_bg: v.optional(v.string()),
    initial_agent: v.optional(initialAgentValidator),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    admin_notes: v.optional(v.string()),
    reviewed_at: v.optional(v.number()),
    created_company_id: v.optional(v.id("companies")),
    initial_agent_submission_id: v.optional(v.id("agentSubmissions")),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_userId", ["user_id"])
    .index("by_status", ["status"]),

  // --- Company Members ---
  companyMembers: defineTable({
    company_id: v.id("companies"),
    user_id: v.optional(v.string()),
    email: v.string(),
    role: v.union(v.literal("owner"), v.literal("member")),
    status: v.union(v.literal("pending"), v.literal("active")),
    invited_by: v.optional(v.string()),
    clerk_invitation_id: v.optional(v.string()),
    invite_url: v.optional(v.string()),
    invite_expires_at: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_companyId", ["company_id"])
    .index("by_userId", ["user_id"])
    .index("by_email", ["email"])
    .index("by_companyAndEmail", ["company_id", "email"]),

  // --- Company Edits ---
  companyEdits: defineTable({
    company_id: v.id("companies"),
    user_id: v.string(),
    payload: v.any(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    admin_notes: v.optional(v.string()),
    created_at: v.number(),
    reviewed_at: v.optional(v.number()),
  })
    .index("by_companyId", ["company_id"])
    .index("by_status", ["status"]),

  // --- GCC Profiles (4 fields: name, org, email, industry) ---
  gccProfiles: defineTable({
    user_id: v.string(),
    name: v.string(),
    email: v.string(),
    organization: v.string(),
    industry: v.string(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_userId", ["user_id"]),

  // --- Agents (directory entries) ---
  agents: defineTable({
    slug: v.optional(v.string()),
    agent_name: v.string(),
    tagline: v.optional(v.string()),
    description: v.string(),
    category: v.string(),
    company_id: v.optional(v.id("companies")),
    logo_url: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    use_cases: v.array(v.any()),
    industries: v.optional(v.array(v.string())),
    functional_categories: v.optional(v.array(v.string())),
    industry_categories: v.optional(v.array(v.string())),
    infrastructure_categories: v.optional(v.array(v.string())),
    expected_outcomes: v.optional(v.array(v.string())),
    integrations: v.optional(v.array(v.string())),
    source_url: v.optional(v.string()),
    integration_type: v.optional(v.string()),
    supported_platforms: v.optional(v.array(v.string())),
    data_requirements: v.optional(v.string()),
    impact_metrics: v.optional(v.array(v.any())),
    demo_url: v.optional(v.string()),
    compliance_certifications: v.optional(v.array(v.string())),
    security_features: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    rating_effectiveness: v.optional(v.number()),
    rating_value: v.optional(v.number()),
    review_count: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    search_text: v.optional(v.string()),
    company_name: v.optional(v.string()),
    company_slug: v.optional(v.string()),
    company_logo_storage_id: v.optional(v.string()),
    company_logo_url: v.optional(v.string()),
    company_logo_bg: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
    // Legacy field from old schema
    provider_profile_id: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_companyId", ["company_id"])
    .searchIndex("search_agents", {
      searchField: "search_text",
      filterFields: ["status", "category"],
    }),

  // --- Agent Submissions (pending admin approval) ---
  agentSubmissions: defineTable({
    user_id: v.string(),
    company_id: v.optional(v.id("companies")),
    slug: v.optional(v.string()),
    agent_name: v.string(),
    tagline: v.optional(v.string()),
    description: v.string(),
    category: v.string(),
    logo_url: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    use_cases: v.array(v.any()),
    industries: v.optional(v.array(v.string())),
    functional_categories: v.optional(v.array(v.string())),
    industry_categories: v.optional(v.array(v.string())),
    infrastructure_categories: v.optional(v.array(v.string())),
    expected_outcomes: v.optional(v.array(v.string())),
    integrations: v.optional(v.array(v.string())),
    source_url: v.optional(v.string()),
    integration_type: v.optional(v.string()),
    supported_platforms: v.optional(v.array(v.string())),
    data_requirements: v.optional(v.string()),
    impact_metrics: v.optional(v.array(v.any())),
    demo_url: v.optional(v.string()),
    compliance_certifications: v.optional(v.array(v.string())),
    security_features: v.optional(v.array(v.string())),
    submission_status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("changes_requested")
    ),
    admin_notes: v.optional(v.string()),
    reviewed_at: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
    // Legacy field from old schema
    provider_profile_id: v.optional(v.string()),
  })
    .index("by_userId", ["user_id"])
    .index("by_status", ["submission_status"]),

  // --- Materialized Directory Stats ---
  directoryStats: defineTable({
    key: v.string(),
    total_active_agents: v.number(),
    company_count: v.number(),
    category_counts: v.any(),
    updated_at: v.number(),
  }).index("by_key", ["key"]),

  // --- Lightweight Agent Directory Cards ---
  agentDirectoryCards: defineTable({
    agent_id: v.id("agents"),
    slug: v.optional(v.string()),
    agent_name: v.string(),
    tagline: v.optional(v.string()),
    category: v.string(),
    company_id: v.optional(v.id("companies")),
    company_name: v.optional(v.string()),
    company_slug: v.optional(v.string()),
    company_logo_storage_id: v.optional(v.string()),
    company_logo_url: v.optional(v.string()),
    company_logo_bg: v.optional(v.string()),
    functional_categories: v.optional(v.array(v.string())),
    industry_categories: v.optional(v.array(v.string())),
    infrastructure_categories: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    review_count: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    search_text: v.optional(v.string()),
    updated_at: v.number(),
  })
    .index("by_agentId", ["agent_id"])
    .index("by_status", ["status"])
    .searchIndex("search_agent_directory_cards", {
      searchField: "search_text",
      filterFields: ["status", "category"],
    }),

  // --- Agent Edits ---
  agentEdits: defineTable({
    agent_id: v.id("agents"),
    user_id: v.string(),
    payload: v.any(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    admin_notes: v.optional(v.string()),
    reviewed_at: v.optional(v.number()),
    created_at: v.number(),
  })
    .index("by_userId", ["user_id"])
    .index("by_status", ["status"]),

  // --- Agent Shortlists ---
  agentShortlists: defineTable({
    user_id: v.optional(v.string()),
    agent_id: v.id("agents"),
    created_at: v.number(),
    // Legacy fields from old schema (will be migrated)
    gcc_org_id: v.optional(v.string()),
    created_by_user_id: v.optional(v.string()),
  })
    .index("by_userId", ["user_id"])
    .index("by_userAndAgent", ["user_id", "agent_id"]),

  // --- Contact Logs ---
  contactLogs: defineTable({
    gcc_user_id: v.string(),
    agent_id: v.id("agents"),
    company_id: v.optional(v.id("companies")),
    contacted_at: v.number(),
    // Legacy fields from old schema
    gcc_org_id: v.optional(v.string()),
    provider_profile_id: v.optional(v.string()),
  }).index("by_gccUserId", ["gcc_user_id"]),

  // --- Provider Requests (GCC to Provider, admin-gated) ---
  providerRequests: defineTable({
    company_id: v.optional(v.id("companies")),
    gcc_user_id: v.string(),
    // Keep these optional while legacy production rows are backfilled.
    gcc_name: v.optional(v.string()),
    gcc_email: v.optional(v.string()),
    gcc_organization: v.optional(v.string()),
    gcc_industry: v.optional(v.string()),
    agent_id: v.id("agents"),
    use_case: v.optional(v.string()),
    current_challenge: v.optional(v.string()),
    expected_outcome: v.optional(v.string()),
    timeline: v.optional(v.string()),
    request_source: v.optional(
      v.union(v.literal("agent_detail"), v.literal("company_profile"))
    ),
    admin_notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending_admin"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("contacted"),
      v.literal("archived")
    ),
    reviewed_at: v.optional(v.number()),
    contacted_at: v.optional(v.number()),
    contacted_by_user_id: v.optional(v.string()),
    created_at: v.number(),
    // Legacy fields from old schema
    gcc_user_email: v.optional(v.string()),
    message: v.optional(v.string()),
    gcc_org_id: v.optional(v.string()),
    provider_profile_id: v.optional(v.string()),
  })
    .index("by_gccUserId", ["gcc_user_id"])
    .index("by_gccUserAndCompany", ["gcc_user_id", "company_id"])
    .index("by_status", ["status"])
    .index("by_companyId", ["company_id"]),

  // --- Job Board Profiles ---
  jobProfiles: defineTable({
    clerk_user_id: v.string(),
    role: v.union(...JOB_BOARD_ROLES.map((role) => v.literal(role))),
    name: v.string(),
    email: v.string(),
    company_name: v.optional(v.string()),
    current_title: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
    phone: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_clerkUserId", ["clerk_user_id"])
    .index("by_role", ["role"]),

  // --- Job Board Jobs ---
  jobs: defineTable({
    slug: v.string(),
    recruiter_id: v.id("jobProfiles"),
    title: v.string(),
    company_name: v.string(),
    location: v.string(),
    workplace_type: v.union(
      ...JOB_WORKPLACE_TYPES.map((value) => v.literal(value))
    ),
    job_type: v.union(...JOB_TYPES.map((value) => v.literal(value))),
    seniority: v.union(
      ...JOB_SENIORITY_LEVELS.map((value) => v.literal(value))
    ),
    category: v.union(...JOB_CATEGORIES.map((value) => v.literal(value))),
    description: v.string(),
    requirements: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    salary_min: v.optional(v.number()),
    salary_max: v.optional(v.number()),
    salary_type: v.optional(v.union(...SALARY_TYPES.map((value) => v.literal(value)))),
    salary_currency: v.optional(v.string()),
    num_openings: v.optional(v.number()),
    apply_url: v.optional(v.string()),
    deadline: v.optional(v.number()),
    status: v.union(...JOB_STATUSES.map((value) => v.literal(value))),
    admin_notes: v.optional(v.string()),
    reviewed_at: v.optional(v.number()),
    closed_at: v.optional(v.number()),
    search_text: v.string(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_recruiterId", ["recruiter_id"])
    .index("by_status_created", ["status", "created_at"])
    .searchIndex("search_jobs", {
      searchField: "search_text",
      filterFields: ["status", "category", "workplace_type", "job_type", "seniority"],
    }),

  // --- Job Board Applications ---
  jobApplications: defineTable({
    job_id: v.id("jobs"),
    applicant_id: v.id("jobProfiles"),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    current_company: v.optional(v.string()),
    current_title: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
    years_of_experience: v.number(),
    cover_note: v.optional(v.string()),
    resume_storage_id: v.string(),
    resume_file_name: v.string(),
    resume_content_type: v.string(),
    resume_size_bytes: v.number(),
    recruiter_status: v.union(
      ...APPLICATION_STATUSES.map((value) => v.literal(value))
    ),
    applied_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_jobId", ["job_id"])
    .index("by_applicantId", ["applicant_id"])
    .index("by_jobAndApplicant", ["job_id", "applicant_id"]),

  // --- Reviews ---
  reviews: defineTable({
    reviewer_id: v.string(),
    reviewer_name: v.string(),
    reviewer_organization: v.optional(v.string()),
    provider_request_id: v.optional(v.id("providerRequests")),
    agent_id: v.id("agents"),
    company_id: v.id("companies"),
    rating_overall: v.number(),
    rating_effectiveness: v.number(),
    rating_value: v.number(),
    title: v.string(),
    pros: v.string(),
    cons: v.string(),
    use_case: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("flagged"),
      v.literal("removed")
    ),
    moderation_reason: v.optional(v.string()),
    admin_notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
    reviewed_at: v.optional(v.number()),
  })
    .index("by_agent_status_created", ["agent_id", "status", "created_at"])
    .index("by_reviewer", ["reviewer_id", "created_at"])
    .index("by_reviewer_agent", ["reviewer_id", "agent_id"])
    .index("by_company_status_created", ["company_id", "status", "created_at"])
    .index("by_status_created", ["status", "created_at"])
    .index("by_provider_request", ["provider_request_id"]),

  // --- Review Responses ---
  reviewResponses: defineTable({
    review_id: v.id("reviews"),
    company_id: v.id("companies"),
    responder_id: v.string(),
    responder_name: v.optional(v.string()),
    body: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("removed")
    ),
    moderation_reason: v.optional(v.string()),
    admin_notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
    reviewed_at: v.optional(v.number()),
  })
    .index("by_review", ["review_id"])
    .index("by_company_status_created", ["company_id", "status", "created_at"])
    .index("by_status_created", ["status", "created_at"]),

  // --- User Notifications ---
  notifications: defineTable({
    recipient_user_id: v.string(),
    audience_role: v.union(v.literal("provider"), v.literal("gcc")),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    link: v.string(),
    entity_type: v.string(),
    entity_id: v.string(),
    metadata: v.optional(v.any()),
    dedupe_key: v.string(),
    read_at: v.optional(v.number()),
    emailed_at: v.optional(v.number()),
    created_at: v.number(),
  })
    .index("by_recipientUserIdAndCreatedAt", ["recipient_user_id", "created_at"])
    .index("by_dedupeKey", ["dedupe_key"]),

  notificationUserStates: defineTable({
    user_id: v.string(),
    unread_count: v.number(),
    updated_at: v.number(),
  }).index("by_userId", ["user_id"]),

  // --- AI Pulse Daily Briefs ---
  aiPulseBriefs: defineTable({
    slug: v.string(),
    date: v.string(),
    editor_headline: v.optional(v.string()),
    top_developments: v.array(
      v.object({
        headline: v.string(),
        description: v.string(),
        source: v.object({ label: v.string(), url: v.string() }),
      })
    ),
    use_case: v.object({
      title: v.string(),
      description: v.string(),
      source: v.object({ label: v.string(), url: v.string() }),
    }),
    enterprise_impact: v.array(v.string()),
    opportunities: v.array(v.object({ title: v.string(), description: v.string() })),
    risks: v.array(v.object({ title: v.string(), description: v.string() })),
    generation_model: v.optional(v.string()),
    generation_duration_ms: v.optional(v.number()),
    created_at: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_date", ["date"]),

  // --- Admin Audit Logs ---
  adminAuditLogs: defineTable({
    actor_user_id: v.string(),
    action: v.string(),
    entity_type: v.string(),
    entity_id: v.optional(v.string()),
    metadata: v.optional(v.any()),
    created_at: v.number(),
  })
    .index("by_actorUserId", ["actor_user_id"])
    .index("by_createdAt", ["created_at"]),
});
