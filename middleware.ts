// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

<<<<<<< HEAD
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
=======
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
>>>>>>> 03632a353ac2be0f36de7531a7e47c12b1330d10
