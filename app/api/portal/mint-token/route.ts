// app/api/portal/mint-token/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getAuth, clerkClient } from "@clerk/nextjs/server";

const JWT_SECRET = process.env.PORTAL_JWT_SECRET ?? "";
const TTL = Number(process.env.PORTAL_TOKEN_TTL_SECONDS ?? 300);
const REQUIRED_ROLE = process.env.PORTAL_ADMIN_ROLE ?? "admin";

export async function POST(req: NextRequest) {
  // get auth from Clerk cookies
  const auth = getAuth();
  const userId = auth.userId;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // fetch user to check role/metadata
  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata?.role ?? user.unsafeMetadata?.role; // depending on where you store it

  if (role !== REQUIRED_ROLE) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { ticket } = body ?? {};
  if (!ticket) return NextResponse.json({ error: "ticket required" }, { status: 400 });

  const now = Math.floor(Date.now() / 1000);
  // add jti for single-use token tracking
  const jti = `tk_${Math.random().toString(36).slice(2, 10)}`;

  const payload = {
    sub: userId,
    aud: "ethub-portal",
    ticket,
    jti,
    iat: now,
    exp: now + TTL,
  };

  const token = jwt.sign(payload, JWT_SECRET);

  // Optionally: persist token jti -> unused in Convex
  // await callConvexToSaveToken({ jti, ticket, createdBy: userId, expiresAt: now + TTL });

  const link = `${process.env.PORTAL_URL ?? "https://portal.example.com"}/repair?token=${encodeURIComponent(token)}&ticket=${encodeURIComponent(ticket)}`;

  return NextResponse.json({ token, link, expiresIn: TTL }, { status: 201 });
}
