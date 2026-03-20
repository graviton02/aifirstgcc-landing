import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { upsertProviderProfile } from "./providerProfiles";

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

    const createdCompany = latest.created_company_id
      ? await ctx.db.get(latest.created_company_id)
      : null;

    return {
      ...latest,
      created_company_name: createdCompany?.name ?? null,
      created_company_slug: createdCompany?.slug ?? null,
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
    company_size: v.string(),
    primary_verticals: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const contact_email = cleanString(args.contact_email).toLowerCase();
    const company_name = cleanString(args.company_name);
    const website = cleanString(args.website);
    const description = cleanString(args.description);
    const headquarters = cleanString(args.headquarters);
    const company_size = cleanString(args.company_size);
    const primary_verticals = args.primary_verticals.map(cleanString).filter(Boolean);

    if (company_name.length < 2) throw new Error("Company name must be at least 2 characters.");
    if (!contact_email.includes("@")) throw new Error("A valid contact email is required.");
    if (description.length < 20) throw new Error("Description must be at least 20 characters.");
    if (headquarters.length < 2) throw new Error("Headquarters is required.");
    if (company_size.length < 1) throw new Error("Company size is required.");
    if (primary_verticals.length < 1) throw new Error("Add at least one primary vertical.");

    const existing = await ctx.db
      .query("companySubmissions")
      .withIndex("by_userId", (q) => q.eq("user_id", userId))
      .collect();

    const activeSubmission = existing.find(
      (submission) => submission.status === "pending" || submission.status === "approved"
    );

    if (activeSubmission?.status === "pending") {
      throw new Error("You already have a company submission under review.");
    }

    if (activeSubmission?.status === "approved") {
      throw new Error("Your company listing is already active.");
    }

    await upsertProviderProfile(ctx, userId, "create_new");

    const now = Date.now();
    return await ctx.db.insert("companySubmissions", {
      user_id: userId,
      contact_email,
      company_name,
      website,
      description,
      headquarters,
      company_size,
      primary_verticals,
      status: "pending",
      created_at: now,
      updated_at: now,
    });
  },
});
