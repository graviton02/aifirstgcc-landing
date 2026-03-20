import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    company_size: v.string(),
    logo_url: v.optional(v.string()),
    primary_verticals: v.array(v.string()),
    contact_email: v.optional(v.string()),
    verification_status: v.union(v.literal("unverified"), v.literal("verified"), v.literal("flagged")),
    claim_status: v.union(v.literal("unclaimed"), v.literal("pending"), v.literal("approved"), v.literal("claimed")),
    claimed_by_user_id: v.optional(v.string()),
    claimed_at: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_slug", ["slug"])
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
    company_size: v.string(),
    primary_verticals: v.array(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    admin_notes: v.optional(v.string()),
    reviewed_at: v.optional(v.number()),
    created_company_id: v.optional(v.id("companies")),
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
    business_functions: v.optional(v.array(v.string())),
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
    review_count: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    search_text: v.optional(v.string()),
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
    business_functions: v.optional(v.array(v.string())),
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
    gcc_user_email: v.string(),
    gcc_user_id: v.string(),
    agent_id: v.id("agents"),
    message: v.optional(v.string()),
    admin_notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending_admin"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("contacted"),
      v.literal("archived")
    ),
    reviewed_at: v.optional(v.number()),
    created_at: v.number(),
    // Legacy fields from old schema
    gcc_org_id: v.optional(v.string()),
    provider_profile_id: v.optional(v.string()),
  })
    .index("by_gccUserId", ["gcc_user_id"])
    .index("by_status", ["status"])
    .index("by_companyId", ["company_id"]),

  // --- Admin Sessions ---
  adminSessions: defineTable({
    session_token: v.string(),
    expires_at: v.number(),
    created_at: v.number(),
  }).index("by_token", ["session_token"]),
});
