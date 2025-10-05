import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.PORTAL_JWT_SECRET ?? "";
const TOKEN_TTL_SECONDS = Number(process.env.PORTAL_TOKEN_TTL_SECONDS ?? 300);

export async function POST(req: NextRequest) {
  const { ticket, sub } = await req.json() ?? {};
  if (!ticket || !sub) return NextResponse.json({ error: "ticket and sub required" }, { status: 400 });

  const now = Math.floor(Date.now() / 1000);
  const token = jwt.sign({ sub, aud: "ethub-portal", ticket, iat: now, exp: now + TOKEN_TTL_SECONDS }, JWT_SECRET);
  const link = `${process.env.PORTAL_URL ?? "https://portal.example.com"}/repair?token=${encodeURIComponent(token)}&ticket=${encodeURIComponent(ticket)}`;

  return NextResponse.json({ token, link, expiresIn: TOKEN_TTL_SECONDS }, { status: 201 });
}
