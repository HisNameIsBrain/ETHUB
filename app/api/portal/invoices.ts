import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.PORTAL_JWT_SECRET ?? "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = req.headers.authorization ?? "";
  const match = auth.match(/^Bearer (.+)$/);
  if (!match) return res.status(401).json({ error: "Missing token" });

  const token = match[1];
  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const body = req.body;
  if (!body || (!body.name && !body.phone && !body.ticketId)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const invoice = {
    ticketId: String(body.ticketId ?? "TBA"),
    name: String(body.name ?? ""),
    phone: String(body.phone ?? ""),
    manufacturer: String(body.manufacturer ?? ""),
    description: String(body.description ?? ""),
    quote: body.quote ?? null,
    deposit: body.deposit ?? null,
    service: body.service ?? null,
    due: body.due ?? null,
    warrantyAcknowledged: !!body.warrantyAcknowledged,
    createdBy: payload.sub ?? "unknown",
    createdAt: new Date().toISOString(),
    raw: body.raw ?? null,
  };

  // TODO: replace with real DB persist
  // e.g. const saved = await db.invoices.insert(invoice);
  const savedId = "inv_" + Math.random().toString(36).slice(2, 9);
  console.log(`Invoice saved ${savedId} by ${invoice.createdBy} ticket=${invoice.ticketId}`);

  return res.status(201).json({ id: savedId });
}
