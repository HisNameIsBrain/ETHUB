// app/api/auth/token/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Issues a short-lived JWT using your Clerk JWT Template (default: "convex")
export async function GET() {
  try {
    const { userId, getToken } = auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = await getToken({ template: process.env.CLERK_JWT_TEMPLATE_NAME || "convex" });
    if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

    return NextResponse.json({ token });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Token error" }, { status: 500 });
  }
}
