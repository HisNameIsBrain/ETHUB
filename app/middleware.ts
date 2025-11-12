import { NextRequest } from "next/server";
// IMPORTANT: import from the server entrypoint
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/",
  "/dashboard(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/api(.*)",
]);

export function middleware(req: NextRequest) {
  // clerkMiddleware returns a handler you call with the request (edge)
  return clerkMiddleware(async (auth) => {
    if (!isPublic(req)) {
      await auth.protect();
    }
  })(req);
}

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|txt|xml)).*)",
    "/(api|trpc)(.*)",
  ],
};
