import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();
  const isAdminRoute = req.nextUrl.pathname.startsWith("/services/admin");
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

// ✅ Route matcher for applying this middleware
export const config = {
  matcher: [
    "/((?!_next|.*\\..*|api/auth|api/webhook).*)", // optional broader matching
    "/services/admin(.*)",                         // specifically protect admin paths
  ],
};
