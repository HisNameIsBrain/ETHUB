import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.PORTAL_JWT_SECRET ?? "";
const TOKEN_TTL_SECONDS = Number(process.env.PORTAL_TOKEN_TTL_SECONDS ?? 300); // default 5m

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // IMPORTANT: add your admin auth check here.
  // e.g. check req.headers.cookie or session
  // For now this is intentionally minimal.
  const { ticket, sub } = req.body ?? {};
  if (!ticket || !sub) return res.status(400).json({ error: "ticket and sub required" });

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub,
    aud: "ethub-portal",
    ticket,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const token = jwt.sign(payload, JWT_SECRET);
  const link = `${process.env.PORTAL_URL ?? "https://your-portal.example.com"}/repair?token=${encodeURIComponent(
    token,
  )}&ticket=${encodeURIComponent(ticket)}`;

  return res.status(201).json({ token, link, expiresIn: TOKEN_TTL_SECONDS });
}
