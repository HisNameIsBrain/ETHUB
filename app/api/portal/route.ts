import { NextRequest, NextResponse } from "next/server";

type Invoice = {
  ticketId: string;
  name: string | null;
  phone: string | null;
  manufacturer: string | null;
  description: string | null;
  quote: string | null;
  deposit: string | null;
  service: string | null;
  due: string | null;
  warrantyAcknowledged: boolean;
  raw: Record<string, string>;
  status?: "received" | "in-progress" | "completed";
  createdAt: string;
};

// In-memory store (replace with DB in production)
const invoices: Invoice[] = [];

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token || token !== process.env.PORTAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: Invoice = await req.json();
  payload.createdAt = new Date().toISOString();
  payload.status = "received";

  invoices.push(payload);
  return NextResponse.json({ message: "Invoice received", invoice: payload });
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token || token !== process.env.PORTAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ invoices });
}
