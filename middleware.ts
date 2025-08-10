import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes (add/remove as needed)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)", // webhooks must stay public
  "/services(.*)",
  "/pricing(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return;
  auth().protect(); // require auth for everything else
});

// Skip Next.js internals and static files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};