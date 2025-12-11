// middleware.ts (at project root)
import { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/",
  "/dashboard(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/api(.*)",
]);

export default function middleware(req: NextRequest) {
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
