// convex/auth.config.ts
import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Use your Clerk JWT template issuer domain
      // e.g. https://<noun-verb-00>.clerk.accounts.dev
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex", // must match your Clerk JWT template name
    },
  ],
} satisfies AuthConfig;
