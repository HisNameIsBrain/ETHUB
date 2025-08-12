import { ConvexAuth } from "convex/server";
import { clerk } from "convex/nextjs";

export default ConvexAuth({
  providers: [clerk({
    /* Your Clerk issuer is the *frontend origin* for dev, but Convex needs the **Clerk instance domain** */
    /* For Clerk dev instances it looks like: https://active-grizzly-98.clerk.accounts.dev */
    /* If you use env, set CLERK_JWT_ISSUER to that URL and CLERK_JWT_AUDIENCE = "convex" */
  })],
});