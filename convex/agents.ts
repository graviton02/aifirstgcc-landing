import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { requireActiveMembership } from "./companyMembers";
import { appError } from "./lib/errors";
import {
  getInvalidFunctionalCategories,
  getInvalidIndustryCategories,
} from "../src/lib/categories";
import {
  buildAgentSearchText,
  normalizeAgentEditPayload,
  normalizeAndValidateCompleteAgent,
  normalizeAndValidateAgentTaxonomy,
  stringArraysEqual,
} from "./lib/agentTaxonomy";

const agentUseCaseValidator = v.object({
  title: v.string(),
  description: v.string(),
});

const agentSubmissionDraftArgs = {
  agent_name: v.string(),
  tagline: v.optional(v.string()),
  description: v.string(),
  category: v.string(),
  logo_url: v.optional(v.string()),
  use_cases: v.array(agentUseCaseValidator),
  functional_categories: v.array(v.string()),
  industry_categories: v.array(v.string()),
  infrastructure_categories: v.optional(v.array(v.string())),
  expected_outcomes: v.optional(v.array(v.string())),
  integrations: v.optional(v.array(v.string())),
  demo_url: v.optional(v.string()),
  source_url: v.optional(v.string()),
};

type AgentSubmissionDraft = {
  agent_name: string;
  tagline?: string;
  description: string;
  category: string;
  logo_url?: string;
  use_cases: { title: string; description: string }[];
  functional_categories: string[];
  industry_categories: string[];
  infrastructure_categories?: string[];
  expected_outcomes?: string[];
  integrations?: string[];
  demo_url?: string;
  source_url?: string;
};

function buildSubmissionDocument(args: AgentSubmissionDraft) {
  const normalized = normalizeAndValidateCompleteAgent(args);

  return {
    ...args,
    agent_name: normalized.agent_name,
    tagline: normalized.tagline,
    description: normalized.description,
    category: normalized.category,
    use_cases: normalized.use_cases,
    functional_categories: normalized.functional_categories,
    industry_categories: normalized.industry_categories,
    industries: normalized.industries,
    infrastructure_categories: normalized.infrastructure_categories,
    integrations: normalized.integrations,
    expected_outcomes: normalized.expected_outcomes,
    source_url: normalized.source_url,
    demo_url: normalized.demo_url,
  };
}

export const list = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    functional_category: v.optional(v.string()),
    industry_category: v.optional(v.string()),
    infrastructure_category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const pageSize = args.limit ?? 12;

    if (args.search && args.search.trim()) {
      const results = await ctx.db
        .query("agents")
        .withSearchIndex("search_agents", (q) => {
          let sq = q.search("search_text", args.search!);
          sq = sq.eq("status", "active");
          if (args.category) sq = sq.eq("category", args.category);
          return sq;
        })
        .take(pageSize * 3);

      const filtered = applyFilters(results, args);
      return { data: filtered.slice(0, pageSize), count: filtered.length };
    }

    const q = ctx.db.query("agents").withIndex("by_status", (q) => q.eq("status", "active"));
    const all = await q.collect();
    const filtered = applyFilters(all, args);
    return { data: filtered.slice(0, pageSize), count: filtered.length };
  },
});

function applyFilters(agents: any[], args: any) {
  return agents.filter((a) => {
    if (args.category && a.category !== args.category) return false;
    if (args.functional_category && !a.functional_categories?.includes(args.functional_category)) return false;
    if (args.industry_category && !a.industry_categories?.includes(args.industry_category)) return false;
    if (args.infrastructure_category && !a.infrastructure_categories?.includes(args.infrastructure_category)) return false;
    return true;
  });
}

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("agents") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const getByIds = query({
  args: { ids: v.array(v.id("agents")) },
  handler: async (ctx, { ids }) => {
    const agents = await Promise.all(ids.map((id) => ctx.db.get(id)));
    return agents.filter(Boolean);
  },
});

export const getByCompany = query({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    const agents = await ctx.db
      .query("agents")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();

    return agents
      .filter((agent) => agent.status === "active")
      .sort((left, right) => right.updated_at - left.updated_at);
  },
});

export const listAllSlugs = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    return all
      .filter((a) => a.slug)
      .map((a) => ({ slug: a.slug!, updated_at: a.updated_at }));
  },
});

export const getMySubmissions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const submissions = await ctx.db
      .query("agentSubmissions")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .collect();
    return submissions.sort((left, right) => right.created_at - left.created_at);
  },
});

export const getCompanySubmissions = query({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    const userId = await requireAuth(ctx);
    await requireActiveMembership(ctx, userId, company_id);

    const submissions = await ctx.db.query("agentSubmissions").collect();
    return submissions
      .filter((submission) => submission.company_id === company_id)
      .sort((left, right) => right.created_at - left.created_at);
  },
});

export const getMyEdits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return await ctx.db
      .query("agentEdits")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .collect();
  },
});

export const submit = mutation({
  args: {
    company_id: v.id("companies"),
    ...agentSubmissionDraftArgs,
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();
    await requireActiveMembership(ctx, userId, args.company_id);

    return await ctx.db.insert("agentSubmissions", {
      ...buildSubmissionDocument(args),
      user_id: userId,
      submission_status: "pending",
      created_at: now,
      updated_at: now,
    });
  },
});

export const resubmitSubmission = mutation({
  args: {
    submission_id: v.id("agentSubmissions"),
    ...agentSubmissionDraftArgs,
  },
  handler: async (ctx, { submission_id, ...draft }) => {
    const userId = await requireAuth(ctx);
    const submission = await ctx.db.get(submission_id);
    if (!submission) appError("agent_submission_not_found", "Submission not found", 404);
    if (!submission.company_id) {
      appError("agent_submission_company_missing", "Submission is not associated with a company", 400);
    }

    await requireActiveMembership(ctx, userId, submission.company_id);

    if (submission.submission_status !== "changes_requested") {
      appError("agent_submission_resubmit_invalid", "Only submissions with requested changes can be resubmitted", 400);
    }

    await ctx.db.patch(submission_id, {
      ...buildSubmissionDocument(draft),
      user_id: userId,
      submission_status: "pending",
      admin_notes: undefined,
      reviewed_at: undefined,
      updated_at: Date.now(),
    });
  },
});

export const createEdit = mutation({
  args: {
    agent_id: v.id("agents"),
    payload: v.any(),
  },
  handler: async (ctx, { agent_id, payload }) => {
    const userId = await requireAuth(ctx);
    const agent = await ctx.db.get(agent_id);
    if (!agent) appError("agent_not_found", "Agent not found", 404);
    if (!agent.company_id) {
      appError("agent_company_missing", "Agent is not associated with a company", 400);
    }

    await requireActiveMembership(ctx, userId, agent.company_id);

    const nextPayload =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? { ...(payload as Record<string, unknown>) }
        : null;

    if (!nextPayload) {
      appError("agent_edit_payload_invalid", "Payload must be an object.", 400);
    }

    delete nextPayload.business_functions;
    const normalizedPayload = normalizeAgentEditPayload(nextPayload);

    return await ctx.db.insert("agentEdits", {
      agent_id,
      user_id: userId,
      payload: normalizedPayload,
      status: "pending",
      created_at: Date.now(),
    });
  },
});

export const softDelete = mutation({
  args: { agent_id: v.id("agents") },
  handler: async (ctx, { agent_id }) => {
    await requireAuth(ctx);
    await ctx.db.patch(agent_id, { status: "inactive", updated_at: Date.now() });
  },
});

export const seed = mutation({
  args: {
    slug: v.string(),
    agent_name: v.string(),
    tagline: v.optional(v.string()),
    description: v.string(),
    company_id: v.id("companies"),
    category: v.optional(v.string()),
    functional_categories: v.optional(v.array(v.string())),
    industry_categories: v.optional(v.array(v.string())),
    infrastructure_categories: v.optional(v.array(v.string())),
    use_cases: v.optional(v.array(v.any())),
    expected_outcomes: v.optional(v.array(v.string())),
    integrations: v.optional(v.array(v.string())),
    source_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) return existing._id;

    const now = Date.now();
    const { functional_categories, industry_categories, industries } =
      normalizeAndValidateAgentTaxonomy(args);
    const searchText = buildAgentSearchText({
      ...args,
      functional_categories,
      industry_categories,
    });

    return await ctx.db.insert("agents", {
      slug: args.slug,
      agent_name: args.agent_name,
      tagline: args.tagline,
      description: args.description,
      category: args.category ?? "general",
      company_id: args.company_id,
      functional_categories,
      industry_categories,
      industries,
      infrastructure_categories: args.infrastructure_categories,
      use_cases: args.use_cases ?? [],
      expected_outcomes: args.expected_outcomes,
      integrations: args.integrations,
      source_url: args.source_url,
      status: "active",
      search_text: searchText,
      created_at: now,
      updated_at: now,
    });
  },
});

export const backfillTaxonomy = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);

    const now = Date.now();
    const agents = await ctx.db.query("agents").collect();
    const submissions = await ctx.db.query("agentSubmissions").collect();
    const edits = await ctx.db.query("agentEdits").collect();

    let updatedAgents = 0;
    let updatedSubmissions = 0;
    let updatedEdits = 0;

    for (const agent of agents) {
      const { functional_categories, industry_categories, industries } =
        normalizeAndValidateAgentTaxonomy({
          functional_categories: agent.functional_categories,
          industry_categories: agent.industry_categories,
          industries: agent.industries,
        });

      const search_text = buildAgentSearchText({
        agent_name: agent.agent_name,
        description: agent.description,
        tagline: agent.tagline,
        category: agent.category,
        functional_categories,
        industry_categories,
        integrations: agent.integrations,
        expected_outcomes: agent.expected_outcomes,
      });

      const nextPatch: Record<string, unknown> = {};

      if (!stringArraysEqual(agent.functional_categories, functional_categories)) {
        nextPatch.functional_categories = functional_categories;
      }

      if (!stringArraysEqual(agent.industry_categories, industry_categories)) {
        nextPatch.industry_categories = industry_categories;
      }

      if (!stringArraysEqual(agent.industries, industries)) {
        nextPatch.industries = industries;
      }

      if ((agent.search_text ?? "") !== search_text) {
        nextPatch.search_text = search_text;
      }

      if (Object.keys(nextPatch).length > 0) {
        await ctx.db.patch(agent._id, {
          ...nextPatch,
          updated_at: now,
        });
        updatedAgents += 1;
      }
    }

    for (const submission of submissions) {
      const { functional_categories, industry_categories, industries } =
        normalizeAndValidateAgentTaxonomy({
          functional_categories: submission.functional_categories,
          industry_categories: submission.industry_categories,
          industries: submission.industries,
        });

      const nextPatch: Record<string, unknown> = {};

      if (!stringArraysEqual(submission.functional_categories, functional_categories)) {
        nextPatch.functional_categories = functional_categories;
      }

      if (!stringArraysEqual(submission.industry_categories, industry_categories)) {
        nextPatch.industry_categories = industry_categories;
      }

      if (!stringArraysEqual(submission.industries, industries)) {
        nextPatch.industries = industries;
      }

      if (Object.keys(nextPatch).length > 0) {
        await ctx.db.patch(submission._id, {
          ...nextPatch,
          updated_at: now,
        });
        updatedSubmissions += 1;
      }
    }

    for (const edit of edits) {
      const payload =
        edit.payload &&
        typeof edit.payload === "object" &&
        !Array.isArray(edit.payload)
          ? { ...(edit.payload as Record<string, unknown>) }
          : null;

      if (!payload) continue;

      let changed = false;

      const normalizedPayload = normalizeAgentEditPayload(payload);
      if (JSON.stringify(normalizedPayload) !== JSON.stringify(payload)) {
        changed = true;
      }

      if (changed) {
        await ctx.db.patch(edit._id, { payload: normalizedPayload });
        updatedEdits += 1;
      }
    }

    return {
      updatedAgents,
      updatedSubmissions,
      updatedEdits,
    };
  },
});

export const verifyTaxonomyIntegrity = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);

    const agents = await ctx.db.query("agents").collect();
    const submissions = await ctx.db.query("agentSubmissions").collect();

    const summarize = <
      T extends {
        functional_categories?: string[];
        industry_categories?: string[];
        business_functions?: string[];
        agent_name?: string;
        slug?: string;
        submission_status?: string;
      },
    >(
      documents: T[]
    ) => {
      const invalidFunctional = new Map<string, number>();
      const invalidIndustry = new Map<string, number>();
      const invalidDocuments = documents
        .map((document) => {
          const badFunctional = getInvalidFunctionalCategories(
            document.functional_categories
          );
          const badIndustry = getInvalidIndustryCategories(
            document.industry_categories
          );

          if (badFunctional.length === 0 && badIndustry.length === 0) {
            return null;
          }

          return {
            agent_name: document.agent_name,
            slug: document.slug,
            submission_status: document.submission_status,
            invalidFunctional: badFunctional,
            invalidIndustry: badIndustry,
          };
        })
        .filter((document): document is NonNullable<typeof document> => document !== null);

      for (const document of documents) {
        for (const value of getInvalidFunctionalCategories(document.functional_categories)) {
          invalidFunctional.set(value, (invalidFunctional.get(value) ?? 0) + 1);
        }

        for (const value of getInvalidIndustryCategories(document.industry_categories)) {
          invalidIndustry.set(value, (invalidIndustry.get(value) ?? 0) + 1);
        }
      }

      return {
        count: documents.length,
        withBusinessFunctions: documents.filter(
          (document) => document.business_functions !== undefined
        ).length,
        invalidFunctional: Array.from(invalidFunctional.entries()),
        invalidIndustry: Array.from(invalidIndustry.entries()),
        invalidDocuments,
      };
    };

    return {
      agents: summarize(agents),
      agentSubmissions: summarize(submissions),
    };
  },
});

// One-time admin cleanup: unclaim companies and delete test data
export const adminCleanup = mutation({
  args: {
    unclaimSlugs: v.array(v.string()),
    deleteSlugs: v.array(v.string()),
  },
  handler: async (ctx, { unclaimSlugs, deleteSlugs }) => {
    const results: string[] = [];

    for (const slug of unclaimSlugs) {
      const company = await ctx.db
        .query("companies")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!company) { results.push(`${slug}: not found`); continue; }

      await ctx.db.patch(company._id, {
        claim_status: "unclaimed",
        claimed_by_user_id: undefined,
        claimed_at: undefined,
        updated_at: Date.now(),
      });

      const claims = await ctx.db.query("claimRequests")
        .withIndex("by_companyId", (q) => q.eq("company_id", company._id))
        .collect();
      for (const c of claims) {
        if (c.status === "approved" || c.status === "activated" || c.status === "pending") {
          await ctx.db.patch(c._id, { status: "rejected", reviewed_at: Date.now() });
        }
      }

      const members = await ctx.db.query("companyMembers")
        .withIndex("by_companyId", (q) => q.eq("company_id", company._id))
        .collect();
      for (const m of members) await ctx.db.delete(m._id);

      results.push(`${slug}: unclaimed (${claims.length} claims rejected, ${members.length} members removed)`);
    }

    for (const slug of deleteSlugs) {
      const company = await ctx.db
        .query("companies")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!company) { results.push(`${slug}: not found`); continue; }

      const agents = await ctx.db.query("agents")
        .withIndex("by_companyId", (q) => q.eq("company_id", company._id))
        .collect();
      for (const a of agents) await ctx.db.delete(a._id);

      const claims = await ctx.db.query("claimRequests")
        .withIndex("by_companyId", (q) => q.eq("company_id", company._id))
        .collect();
      for (const c of claims) await ctx.db.delete(c._id);

      const members = await ctx.db.query("companyMembers")
        .withIndex("by_companyId", (q) => q.eq("company_id", company._id))
        .collect();
      for (const m of members) await ctx.db.delete(m._id);

      await ctx.db.delete(company._id);
      results.push(`${slug}: DELETED (${agents.length} agents, ${claims.length} claims, ${members.length} members)`);
    }

    return results;
  },
});

// QA data quality fix: strip artifacts, fix integrations, delete test agents
export const fixQualityIssues = mutation({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    let patched = 0;
    let deleted = 0;

    for (const agent of agents) {
      // Delete QA test agents
      if (agent.slug?.includes("qa-browser-agent") || agent.agent_name?.includes("QA Browser Agent")) {
        await ctx.db.delete(agent._id);
        deleted++;
        continue;
      }

      const patch: Record<string, unknown> = {};

      // Fix tagline: strip "QA agent edit <timestamp>"
      if (agent.tagline && /QA agent edit\s*\d*/i.test(agent.tagline)) {
        patch.tagline = agent.tagline.replace(/\s*QA agent edit\s*\d*\s*$/i, "").trim();
      }

      // Fix source_url: strip \n\n---
      if (agent.source_url && agent.source_url.includes("\n\n---")) {
        patch.source_url = agent.source_url.replace(/\n\n---/g, "").trim();
      }

      // Fix integrations: merge fragmented entries
      const integrations = agent.integrations;
      if (integrations && Array.isArray(integrations) && integrations.length > 0) {
        const fixed: string[] = [];
        let changed = false;
        let i = 0;
        while (i < integrations.length) {
          const item = String(integrations[i]);

          // Parenthetical split: "Foo (Bar" + "Baz" + "Qux)"
          if (item.includes("(") && !item.includes(")")) {
            let merged = item;
            let j = i + 1;
            while (j < integrations.length) {
              merged += ", " + String(integrations[j]);
              if (String(integrations[j]).includes(")")) break;
              j++;
            }
            fixed.push(merged);
            i = j + 1;
            changed = true;
          }
          // Number split: "12" + "000+ banks"
          else if (/^\d+$/.test(item.trim()) && i + 1 < integrations.length && /^\d/.test(String(integrations[i + 1]).trim())) {
            fixed.push(item + "," + String(integrations[i + 1]));
            i += 2;
            changed = true;
          }
          // Leading "and ": "and 400+ integrations"
          else if (item.trim().startsWith("and ")) {
            if (fixed.length > 0) {
              fixed[fixed.length - 1] += ", " + item.trim();
            } else {
              fixed.push(item.trim().slice(4));
            }
            i++;
            changed = true;
          }
          // Compliance certs masquerading as integrations
          else if (["SOC 2", "GDPR", "HIPAA compliant"].includes(item.trim())) {
            i++;
            changed = true;
          }
          // Disclaimers
          else if (item.includes("(not further specified)") || item.includes("(not individually named)")) {
            const cleaned = item.replace(/\s*\([^)]*not\s+(further\s+specified|individually\s+named)[^)]*\)/, "").trim();
            if (cleaned) fixed.push(cleaned);
            i++;
            changed = true;
          }
          else {
            fixed.push(item);
            i++;
          }
        }
        if (changed) patch.integrations = fixed;
      }

      if (Object.keys(patch).length > 0) {
        // Rebuild search_text if tagline changed
        if (patch.tagline) {
          const searchText = buildAgentSearchText({
            ...agent,
            tagline: patch.tagline as string,
          });
          patch.search_text = searchText;
        }
        patch.updated_at = Date.now();
        await ctx.db.patch(agent._id, patch);
        patched++;
      }
    }

    return { patched, deleted, totalAgents: agents.length };
  },
});

// Reusable migration: fix capitalization and trailing punctuation on use case titles and expected outcomes
export const fixAgentTextFields = mutation({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    let patchedCount = 0;

    function normalizeText(text: string): string {
      let t = text.trim().replace(/[.;,]\s*$/, "");
      if (t.length > 0) t = t.charAt(0).toUpperCase() + t.slice(1);
      return t;
    }

    for (const agent of agents) {
      const patch: Record<string, unknown> = {};

      // Fix use case titles
      const useCases = agent.use_cases;
      if (useCases && Array.isArray(useCases) && useCases.length > 0) {
        const fixed = useCases.map((uc: { title?: string; description?: string }) => ({
          title: normalizeText(uc.title ?? ""),
          description: uc.description ?? "",
        }));
        if (JSON.stringify(fixed) !== JSON.stringify(useCases)) {
          patch.use_cases = fixed;
        }
      }

      // Fix expected outcomes
      const outcomes = agent.expected_outcomes;
      if (outcomes && Array.isArray(outcomes) && outcomes.length > 0) {
        const fixed = outcomes.map((o: string) => normalizeText(o));
        if (JSON.stringify(fixed) !== JSON.stringify(outcomes)) {
          patch.expected_outcomes = fixed;
        }
      }

      if (Object.keys(patch).length > 0) {
        patch.updated_at = Date.now();
        await ctx.db.patch(agent._id, patch);
        patchedCount++;
      }
    }

    return { patchedCount, totalAgents: agents.length };
  },
});

// Keep old name as alias for CLAUDE.md reference
export const fixUseCaseTitles = fixAgentTextFields;
