import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect all routes except the ones listed
    "/((?!_next/image|_next/static|favicon.ico|api/webhook).*)",
  ],
};