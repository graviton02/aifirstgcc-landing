import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
    claimant_linkedin: v.string(),
  },
  handler: async (ctx, args) => {
    const domain = args.claimant_email.split("@")[1]?.toLowerCase();
    if (!domain || FREE_EMAIL_DOMAINS.has(domain)) {
      throw new Error("Please use a company email address, not a free email provider.");
    }

    const company = await ctx.db.get(args.company_id);
    if (!company) throw new Error("Company not found");
    if (company.claim_status === "claimed") throw new Error("This company has already been claimed.");

    const existing = await ctx.db
      .query("claimRequests")
      .withIndex("by_companyId", (q) => q.eq("company_id", args.company_id))
      .collect();
    const pendingClaim = existing.find((c) => c.status === "pending");
    if (pendingClaim) throw new Error("A claim request is already pending for this company.");

    const id = await ctx.db.insert("claimRequests", {
      ...args,
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

export const getClaimStatus = query({
  args: { company_id: v.id("companies") },
  handler: async (ctx, { company_id }) => {
    return await ctx.db
      .query("claimRequests")
      .withIndex("by_companyId", (q) => q.eq("company_id", company_id))
      .collect();
  },
});
