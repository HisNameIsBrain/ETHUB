<<<<<<< HEAD
// convex/auth.config.js
export default {
  providers: [
    {
      domain: "https://active-grizzly-98.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
=======
// convex/auth.config.ts
import { ConvexAuth } from "convex/server";
import { clerk } from "convex/nextjs";

export default ConvexAuth({
  providers: [
    clerk({
      // Make sure these environment variables are set in both Convex & local dev
      // CLERK_JWT_ISSUER should be your Clerk instance domain, NOT your frontend URL
      // Example: https://active-grizzly-98.clerk.accounts.dev
      // CLERK_JWT_AUDIENCE should literally be "convex"
      issuer: process.env.CLERK_JWT_ISSUER!,
      audience: process.env.CLERK_JWT_AUDIENCE!,
    }),
  ],
});
>>>>>>> 101710d (update auth.config.js)
