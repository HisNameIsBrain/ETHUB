export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api"; // if you use codegen

const JWT_SECRET = process.env.PORTAL_JWT_SECRET ?? "";
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

async function markTokenUsedIfUnused(jti: string, ticket: string, actor: string) {
  // Simple pattern: call a Convex mutation that returns false if token already used
  if (!CONVEX_URL) return true;
  const client = new ConvexHttpClient(CONVEX_URL);
  return client.mutation(api.tokens.markUsed, { jti, ticket, actor });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) return NextResponse.json({ error: "Missing token" }, { status: 401 });
  const token = match[1];

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  if (payload?.aud !== "ethub-portal") {
    return NextResponse.json({ error: "Invalid token audience" }, { status: 401 });
  }

  // Optionally enforce ticket matches request body ticket
  const body = await req.json().catch(() => ({}));
  // e.g. if (body.ticketId && body.ticketId !== payload.ticket) return NextResponse.json({ error: "Ticket mismatch" }, { status: 400 });

  // single-use logic (recommended): attempt to mark token as used; reject if already used
  if (payload.jti) {
    try {
      const ok = await markTokenUsedIfUnused(payload.jti, payload.ticket, payload.sub ?? "unknown");
      if (!ok) return NextResponse.json({ error: "Token already used" }, { status: 409 });
    } catch (err) {
      console.error("Token usage check failed:", err);
      // optionally fail closed or ignore depending on your policy; safer to fail closed
      return NextResponse.json({ error: "Token verification failed" }, { status: 500 });
    }
  }

  // Build invoice to persist (Convex or direct DB)
  const invoice = {
    ticketId: body.ticketId ?? payload.ticket ?? `IC-${Date.now()}`,
    name: body.name ?? null,
    phone: body.phone ?? null,
    manufacturer: body.manufacturer ?? null,
    description: body.description ?? null,
    quote: body.quote ?? null,
    deposit: body.deposit ?? null,
    service: body.service ?? null,
    due: body.due ?? null,
    warrantyAcknowledged: !!body.warrantyAcknowledged,
    createdBy: payload.sub ?? "unknown",
    createdAt: new Date().toISOString(),
    status: "pending",
    raw: body.raw ?? null,
  };

  // persist to Convex via server-side mutation or direct DB
  if (CONVEX_URL) {
    try {
      const client = new ConvexHttpClient(CONVEX_URL);
      await client.mutation(api.invoices.create, invoice);
      return NextResponse.json({ id: invoice.ticketId }, { status: 201 });
    } catch (err) {
      console.error("Convex save failed:", err);
      return NextResponse.json({ error: "Failed to persist invoice" }, { status: 500 });
    }
  }

  // fallback: return created id without persistence
  return NextResponse.json({ id: invoice.ticketId }, { status: 201 });
}
