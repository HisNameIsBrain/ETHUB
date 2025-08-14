// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes (expand as needed)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/edgestore/(.*)", // if you have public upload init; remove if not
]);

export default clerkMiddleware((auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) return;
  
  // Older Clerk versions: no .protect(); do a userId check
  const { userId } = auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return Response.redirect(signInUrl);
  }
});

// Run on everything except Next static files & common assets
export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|txt|xml|mp4|mp3|css|js|map)).*)",
  ],
};