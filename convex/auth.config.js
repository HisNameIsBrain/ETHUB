<<<<<<< HEAD
export default {
  providers: [
    {
      // Replace with your own Clerk Issuer URL from your "convex" JWT template
      // or with `process.env.CLERK_JWT_ISSUER_DOMAIN`
      // and configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ]
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
>>>>>>> 03632a353ac2be0f36de7531a7e47c12b1330d10
