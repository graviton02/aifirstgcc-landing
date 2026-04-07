const clerkJwtIssuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN?.replace(/\/$/, "");

if (!clerkJwtIssuerDomain) {
  throw new Error("CLERK_JWT_ISSUER_DOMAIN must be configured for Convex auth.");
}

export default {
  providers: [
    {
      domain: clerkJwtIssuerDomain,
      applicationID: "convex",
    },
  ],
};
