import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.PORTAL_JWT_SECRET ?? "";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer (.+)$/);
  if (!match) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  const token = match[1];
  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const body = await req.json();
  const invoice = { ...body, createdBy: payload.sub ?? "unknown", createdAt: new Date().toISOString() };
  console.log("Invoice received:", invoice);

  return NextResponse.json({ id: "inv_" + Math.random().toString(36).slice(2,9) }, { status: 201 });
}
