import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { appError } from "./lib/errors";
import { assertCanCreateProviderPersona } from "./lib/personas";
import { upsertProviderProfile } from "./providerProfiles";
import { normalizeAndValidateCompleteAgent } from "./lib/agentTaxonomy";
import { withResolvedLogoUrl } from "./lib/companyLogos";

const agentUseCaseValidator = v.object({
  title: v.string(),
  description: v.string(),
});

const initialAgentValidator = v.object({
  agent_name: v.string(),
  tagline: v.string(),
  description: v.string(),
  category: v.string(),
  functional_categories: v.array(v.string()),
  industry_categories: v.array(v.string()),
  use_cases: v.array(agentUseCaseValidator),
  integrations: v.array(v.string()),
  expected_outcomes: v.array(v.string()),
  source_url: v.string(),
  demo_url: v.optional(v.string()),
});

function cleanString(value: string) {
  return value.trim();
}

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const submissions = await ctx.db
      .query("companySubmissions")
      .withIndex("by_userId", (q) => q.eq("user_id", identity.subject))
      .collect();

    const latest = submissions.sort((a, b) => b.created_at - a.created_at)[0];
    if (!latest) {
      return null;
    }

    const hydratedLatest = await withResolvedLogoUrl(ctx, latest);
    const createdCompany = latest.created_company_id
      ? await withResolvedLogoUrl(ctx, await ctx.db.get(latest.created_company_id))
      : null;
    const initialAgentSubmission = latest.initial_agent_submission_id
      ? await ctx.db.get(latest.initial_agent_submission_id)
      : null;

    return {
      ...hydratedLatest,
      created_company_name: createdCompany?.name ?? null,
      created_company_slug: createdCompany?.slug ?? null,
      initial_agent_submission: initialAgentSubmission,
    };
  },
});

export const create = mutation({
  args: {
    contact_email: v.string(),
    company_name: v.string(),
    website: v.string(),
    description: v.string(),
    headquarters: v.string(),
    logo_storage_id: v.string(),
    primary_verticals: v.array(v.string()),
    logo_bg: v.optional(v.string()),
    initial_agent: initialAgentValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const contact_email = cleanString(args.contact_email).toLowerCase();
    const company_name = cleanString(args.company_name);
    const website = cleanString(args.website);
    const description = cleanString(args.description);
    const headquarters = cleanString(args.headquarters);
    const primary_verticals = args.primary_verticals.map(cleanString).filter(Boolean);
    const logo_bg = args.logo_bg === "dark" ? "dark" : undefined;
    const normalizedInitialAgent = normalizeAndValidateCompleteAgent(args.initial_agent);
    const initial_agent = {
      agent_name: normalizedInitialAgent.agent_name,
      tagline: normalizedInitialAgent.tagline,
      description: normalizedInitialAgent.description,
      category: normalizedInitialAgent.category,
      functional_categories: normalizedInitialAgent.functional_categories ?? [],
      industry_categories: normalizedInitialAgent.industry_categories ?? [],
      use_cases: normalizedInitialAgent.use_cases,
      integrations: normalizedInitialAgent.integrations,
      expected_outcomes: normalizedInitialAgent.expected_outcomes,
      source_url: normalizedInitialAgent.source_url,
      demo_url: normalizedInitialAgent.demo_url,
    };

    if (company_name.length < 2) appError("company_name_short", "Company name must be at least 2 characters.", 400);
    if (!contact_email.includes("@")) appError("company_contact_email_invalid", "A valid contact email is required.", 400);
    if (description.length < 20) appError("company_description_short", "Description must be at least 20 characters.", 400);
    if (headquarters.length < 2) appError("company_headquarters_required", "Headquarters is required.", 400);
    if (!args.logo_storage_id) appError("company_logo_required", "Upload a company logo before submitting.", 400);
    if (primary_verticals.length < 1) appError("company_vertical_required", "Add at least one primary vertical.", 400);

    const existing = await ctx.db
      .query("companySubmissions")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .collect();

    const activeSubmission = existing.find(
      (submission) => submission.status === "pending" || submission.status === "approved"
    );

    if (activeSubmission?.status === "pending") {
      appError("company_submission_pending", "You already have a company submission under review.", 409);
    }

    if (activeSubmission?.status === "approved") {
      appError("company_submission_active", "Your company listing is already active.", 409);
    }

    await assertCanCreateProviderPersona(ctx, userId);
    await upsertProviderProfile(ctx, userId, "create_new");

    const now = Date.now();
    return await ctx.db.insert("companySubmissions", {
      user_id: userId,
      contact_email,
      company_name,
      website,
      description,
      headquarters,
      logo_storage_id: args.logo_storage_id,
      primary_verticals,
      ...(logo_bg ? { logo_bg } : {}),
      initial_agent,
      status: "pending",
      created_at: now,
      updated_at: now,
    });
  },
});
