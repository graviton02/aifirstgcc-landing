import { query } from "./_generated/server";
import { getAuthoritativeRole } from "../src/auth/roles";

export const getContext = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        role: null,
        providerSetupStarted: false,
      };
    }

    const [company, gccProfile, providerProfile] = await Promise.all([
      ctx.db
        .query("companyMembers")
        .withIndex("by_userId", (q) => q.eq("user_id", identity.subject))
        .collect()
        .then((memberships) =>
          memberships.find((entry) => entry.status === "active") ?? null
        ),
      ctx.db
        .query("gccProfiles")
        .withIndex("by_userId", (q) => q.eq("user_id", identity.subject))
        .unique(),
      ctx.db
        .query("providerProfiles")
        .withIndex("by_userId", (q) => q.eq("user_id", identity.subject))
        .unique(),
    ]);

    return {
      role: getAuthoritativeRole({
        hasProviderAccess: Boolean(company),
        hasGccProfile: Boolean(gccProfile),
      }),
      providerSetupStarted: Boolean(providerProfile || company),
    };
  },
});
