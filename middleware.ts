// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/",
  "/services(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/api/public(.*)",
  "/api/tts",            // TTS is intentionally public (no auth redirects)
]);

export default clerkMiddleware((auth, req) => {
  // Let public routes through
  if (isPublic(req)) return;

  const { userId, redirectToSignIn } = auth();

  // If not signed in:
  if (!userId) {
    // For API routes: return JSON (not HTML)
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      });
    }
    // For pages: redirect to sign-in (browser UX)
    return redirectToSignIn();
  }

  // Signed in: allow
  return;
});

// Run middleware for app pages + API, but skip Next internals & static assets
export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|txt|xml|css|js|map|mp4|mp3|wav|ogg)).*)",
    "/(api|trpc)(.*)",
  ],
};
