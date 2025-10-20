// pages/api/mobilesentrix/prices.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Example MobileSentrix proxy.
 * Expects: /api/mobilesentrix/prices?query=...
 * Returns: { recommended: {...}, alternative: {...} }
 *
 * Adapt this to match the real MobileSentrix API contract.
 */

const MOBILESENTRIX_URL = process.env.MOBILESENTRIX_URL || ""; // e.g., https://api.mobilesentrix.com/parts
const MOBILESENTRIX_KEY = process.env.MOBILESENTRIX_KEY || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const q = String(req.query.query || "");
    if (!q) return res.status(400).json({ error: "missing query" });

    if (!MOBILESENTRIX_URL || !MOBILESENTRIX_KEY) {
      // If you don't have MobileSentrix available yet, you can return a demo response
      return res.status(200).json({
        recommended: {
          title: `${q} — Premium Part`,
          partPrice: 89.99,
          labor: 60,
          total: 149.99,
          minPrice: 89.99,
        },
        alternative: {
          title: `${q} — Economical Part`,
          partPrice: 59.99,
          labor: 40,
          total: 99.99,
          maxPrice: 59.99,
        },
      });
    }

    // Example request to MobileSentrix (adapt path/params to actual API)
    const params = new URLSearchParams({ q, api_key: MOBILESENTRIX_KEY });
    const r = await fetch(`${MOBILESENTRIX_URL}?${params.toString()}`, { method: "GET" });

    if (!r.ok) {
      const body = await r.text().catch(() => "");
      console.error("mobilesentrix proxy error", r.status, body);
      return res.status(502).json({ error: "mobilesentrix fetch failed", status: r.status, body });
    }

    const json = await r.json();

    // Adapt this mapping to the real response shape
    // Example: pick two parts from suppliers response
    const recommended = json.recommended ?? json.parts?.[0] ?? null;
    const alternative = json.alternative ?? json.parts?.[1] ?? null;

    return res.status(200).json({ recommended, alternative });
  } catch (err) {
    console.error("mobilesentrix route error", err);
    return res.status(500).json({ error: "internal error" });
  }
}
