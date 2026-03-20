import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId, requireAuth } from "./lib/auth";
import { upsertProviderProfile } from "./providerProfiles";

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com",
  "aol.com", "icloud.com", "mail.com", "protonmail.com", "zoho.com",
  "yandex.com", "gmx.com", "fastmail.com", "tutanota.com",
]);

export const submitClaim = mutation({
  args: {
    company_id: v.id("companies"),
    claimant_name: v.string(),
    claimant_email: v.string(),
  },
  handler: async (ctx, args) => {
    // Name validation
    const trimmedName = args.claimant_name.trim();
    if (trimmedName.length < 2) {
      throw new Error("Name must be at least 2 characters.");
    }
    if (trimmedName.includes("@")) {
      throw new Error("Please enter a name, not an email address.");
    }

    // Corporate email validation
    const domain = args.claimant_email.split("@")[1]?.toLowerCase();
    if (!domain || FREE_EMAIL_DOMAINS.has(domain)) {
      throw new Error("Please use a company email address, not a free email provider.");
    }

    const company = await ctx.db.get(args.company_id);
    if (!company) throw new Error("Company not found");
    if (company.claim_status === "claimed") throw new Error("This company has already been claimed.");
    const userId = await getAuthUserId(ctx);

    // Check for existing pending claim
    const existing = await ctx.db
      .query("claimRequests")
      .withIndex("by_companyId", (q) => q.eq("company_id", args.company_id))
      .collect();
    const pendingClaim = existing.find((c) => c.status === "pending" || c.status === "approved");
    if (pendingClaim) throw new Error("A claim request is already pending for this company.");

    if (userId) {
      await upsertProviderProfile(ctx, userId, "claim_existing");
    }

    const id = await ctx.db.insert("claimRequests", {
      company_id: args.company_id,
      claimant_name: args.claimant_name,
      claimant_email: args.claimant_email,
      claimant_user_id: userId ?? undefined,
      status: "pending",
      created_at: Date.now(),
    });

    await ctx.db.patch(args.company_id, {
      claim_status: "pending",
      updated_at: Date.now(),
    });

    return id;
  },
});

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const claims = await ctx.db
      .query("claimRequests")
      .withIndex("by_claimantUserId", (q) => q.eq("claimant_user_id", userId))
      .collect();

    const latestClaim = claims.sort((a, b) => b.created_at - a.created_at)[0];
    if (!latestClaim) {
      return null;
    }

    const company = await ctx.db.get(latestClaim.company_id);
    return {
      ...latestClaim,
      company_name: company?.name ?? "Unknown Company",
      company_slug: company?.slug ?? null,
    };
  },
});

export const getClaimStatus = query({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    return await ctx.db
      .query("claimRequests")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
  },
});

export const validateMagicLink = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const claim = await ctx.db
      .query("claimRequests")
      .withIndex("by_magicLinkToken", (q) => q.eq("magic_link_token", token))
      .unique();

    if (!claim) return { valid: false, error: "Invalid link" } as const;
    if (claim.status !== "approved") return { valid: false, error: "This link has already been used" } as const;
    if (claim.magic_link_expires_at && claim.magic_link_expires_at < Date.now()) {
      return { valid: false, error: "This link has expired" } as const;
    }

    const company = await ctx.db.get(claim.company_id);
    return {
      valid: true,
      claimant_name: claim.claimant_name,
      claimant_email: claim.claimant_email,
      company_name: company?.name ?? "Unknown Company",
      company_slug: company?.slug,
    } as const;
  },
});

export const activateClaim = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const userId = await requireAuth(ctx);

    const claim = await ctx.db
      .query("claimRequests")
      .withIndex("by_magicLinkToken", (q) => q.eq("magic_link_token", token))
      .unique();

    if (!claim) throw new Error("Invalid activation link");
    if (claim.status !== "approved") throw new Error("This link has already been used");
    if (claim.magic_link_expires_at && claim.magic_link_expires_at < Date.now()) {
      throw new Error("This activation link has expired");
    }

    const now = Date.now();

    // Mark claim as activated
    await ctx.db.patch(claim._id, {
      status: "activated",
      activated_at: now,
      claimant_user_id: userId,
    });

    // Mark company as claimed
    await ctx.db.patch(claim.company_id, {
      claim_status: "claimed",
      claimed_by_user_id: userId,
      claimed_at: now,
      updated_at: now,
    });

    await upsertProviderProfile(ctx, userId, "claim_existing");

    const existingMembership = await ctx.db
      .query("companyMembers")
      .withIndex("by_companyAndEmail", (q) =>
        q.eq("company_id", claim.company_id).eq("email", claim.claimant_email.toLowerCase())
      )
      .unique();

    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        user_id: userId,
        role: "owner",
        status: "active",
        updated_at: now,
      });
    } else {
      await ctx.db.insert("companyMembers", {
        company_id: claim.company_id,
        user_id: userId,
        email: claim.claimant_email.toLowerCase(),
        role: "owner",
        status: "active",
        created_at: now,
        updated_at: now,
      });
    }

    return { success: true };
  },
});
