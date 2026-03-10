import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const existing = await ctx.db
      .query("earlyAccessSignups")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) return { success: true, duplicate: true };
    await ctx.db.insert("earlyAccessSignups", { email, created_at: Date.now() });
    return { success: true, duplicate: false };
  },
});
