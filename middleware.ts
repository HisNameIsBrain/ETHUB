// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/documents",
  "/",                       // marketing home
  "/services",               // services index
  "/services/:path*",        // any nested services pages
  "/sign-in(.*)",            // auth pages must be public
  "/sign-up(.*)",
  "/api/public/:path*",      // any public APIs you expose
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/_next/:path*",
  "/images/:path*",
  "/icons/:path*",
  "/public/:path*",
]);

export default clerkMiddleware((auth, req) => {
  if (isPublic(req)) return;

  const { userId, redirectToSignIn } = auth();
  if (!userId) {
    // This preserves the original URL so Clerk can send users back after login
    return redirectToSignIn({ returnBackUrl: req.url });
  }
});

// Exclude static assets; protect everything else
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
