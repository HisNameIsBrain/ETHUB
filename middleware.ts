import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
  "/api/edgestore/(.*)",
  "/_next/(.*)",
  "/favicon.ico",
  "/images/(.*)",
  "/fonts/(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return;
  // Require auth for everything else
  auth().protect();
});

export const config = {
  // Protect everything except the public routes above
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};