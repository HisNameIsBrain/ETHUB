// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes should be public
const isPublicRoute = createRouteMatcher([
 "/",
 "/sign-in(.*)",
 "/sign-up(.*)",
]);

export default clerkMiddleware((auth, req) => {
 // Allow public routes through without checks
 if (isPublicRoute(req)) return;
 
 // Clerk v4+ safe approach:
 const { userId } = auth();
 if (!userId) {
  const signInUrl = new URL("/sign-in", req.url);
  signInUrl.searchParams.set("redirect_url", req.url);
  return Response.redirect(signInUrl);
 }
 
 // If you're on Clerk v5+, you could replace the above with:
 // return auth().protect();
});

// Ensure it runs only on relevant routes (exclude static/assets)
export const config = {
 matcher: [
  "/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|txt|xml|css|js|map|mp4|mp3)).*)",
 ],
};