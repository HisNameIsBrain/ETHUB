// convex/auth.config.ts
export default {
  providers: [
    {
      // set on Convex dashboard or .env for local
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex", // must match the Clerk JWT template name
    },
  ],
};
