// app/api/portal/invoices/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api"; // optional: your convex codegen
// NOTE: No scraping here; we use RepairDesk public API.

const JWT_SECRET = process.env.PORTAL_JWT_SECRET ?? "";
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
const REPAIRDESK_API_KEY = process.env.REPAIRDESK_API_KEY ?? "";
const REPAIRDESK_BASE = process.env.REPAIRDESK_BASE_URL ?? "https://api.repairdesk.co/api/web/v1";
const DEFAULT_LABOR = Number(process.env.ETHUB_LABOR_DEFAULT ?? "100");

async function markTokenUsedIfUnused(jti: string, ticket: string, actor: string) {
  if (!CONVEX_URL) return true;
  const client = new ConvexHttpClient(CONVEX_URL);
  const mutationFn = (api as any)?.tokens?.markUsed || (api as any)?.tokens_markUsed;
  if (!mutationFn) {
    console.warn("Convex tokens.markUsed not found; skipping single-use DB guard");
    return true;
  }
  return client.mutation(mutationFn, { jti, ticket, actor });
}

function parseMoney(value: any): number | null {
  if (value == null) return null;
  const s = String(value).replace(/[^0-9.]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Query RepairDesk inventory.
 * RepairDesk docs: base URL is https://api.repairdesk.co/api/web/v1
 * Example: GET /products?api_key=KEY&search=iphone%2015%20screen
 *
 * NOTE: field names returned by your store may vary. Adjust mapping accordingly.
 */
async function lookupRepairDesk(query: string) {
  if (!query) return { recommended: null, alternative: null, source: "none" };

  try {
    const url = `${REPAIRDESK_BASE}/products?api_key=${encodeURIComponent(
      REPAIRDESK_API_KEY
    )}&search=${encodeURIComponent(query)}&limit=6`;

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.warn("RepairDesk API non-OK:", res.status, txt);
      return { recommended: null, alternative: null, source: "repairdesk_api_error", error: `${res.status}` };
    }

    const json = await res.json();

    // Example mapping — adapt to exact JSON structure from your RepairDesk store.
    // We try to pick a premium OEM-like part (first) and an aftermarket cheaper alternative (if provided).
    const items = Array.isArray(json.data) ? json.data : Array.isArray((json as any).products) ? (json as any).products : [];

    if (!items || items.length === 0) {
      return { recommended: null, alternative: null, source: "repairdesk_no_results" };
    }

    // Choose recommended as the first match (assumed highest quality / in-stock)
    const first = items[0];
    const title = first.name ?? first.title ?? first.product_name ?? query;
    const image = (first.images && first.images[0]) || first.image || first.thumbnail || null;
    const rawPrice = first.price ?? first.sell_price ?? first.retail_price ?? null;
    const partPrice = parseMoney(rawPrice);
    const labor = DEFAULT_LABOR;
    const total = partPrice != null ? partPrice + labor : null;

    const recommended = {
      id: first.id ?? first.sku ?? null,
      title,
      image,
      partPrice,
      labor,
      total,
      vendor: "RepairDesk",
      raw: first,
    };

    // Build an alternative (cheaper). If the API returns variants or suppliers, prefer them;
    // otherwise use a heuristic (60% of premium price) to show an economical aftermarket choice.
    let alternative: any = null;
    // If RepairDesk returns multiple price tiers or variants, attempt to find cheaper item
    const cheaper = items.find((it: any) => parseMoney(it.price ?? it.sell_price) && parseMoney(it.price ?? it.sell_price) < partPrice);
    if (cheaper) {
      const altPrice = parseMoney(cheaper.price ?? cheaper.sell_price);
      alternative = {
        id: cheaper.id ?? cheaper.sku ?? null,
        title: cheaper.name ?? cheaper.product_name ?? `${title} (alternative)`,
        image: (cheaper.images && cheaper.images[0]) || cheaper.image || image,
        partPrice: altPrice,
        labor,
        total: altPrice != null ? altPrice + labor : null,
        vendor: "RepairDesk (alt)",
        raw: cheaper,
      };
    } else {
      // heuristic alternative
      const altPrice = partPrice != null ? Math.max(25, Math.round(partPrice * 0.6 * 100) / 100) : null;
      alternative = {
        id: null,
        title: `${title} (aftermarket)`,
        image,
        partPrice: altPrice,
        labor,
        total: altPrice != null ? altPrice + labor : null,
        vendor: "Aftermarket (heuristic)",
      };
    }

    return { recommended, alternative, source: "repairdesk_api", raw: json };
  } catch (err: any) {
    console.error("RepairDesk lookup failed:", err?.message ?? err);
    return { recommended: null, alternative: null, source: "error", error: String(err) };
  }
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

  if (payload?.aud !== "ethub-portal") return NextResponse.json({ error: "Invalid token audience" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // single-use guard
  if (payload.jti) {
    try {
      const ok = await markTokenUsedIfUnused(payload.jti, payload.ticket, payload.sub ?? "unknown");
      if (!ok) return NextResponse.json({ error: "Token already used" }, { status: 409 });
    } catch (err) {
      console.error("Token usage check failed:", err);
      return NextResponse.json({ error: "Token verification failed" }, { status: 500 });
    }
  }

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

  // If client provided a partQuery (preferred) use that; else fall back to Description/model
  const partQuery = (body.partQuery ?? body.service ?? body.raw?.Description ?? body.raw?.description ?? "").toString().trim();
  let partsResult = { recommended: null, alternative: null, source: "none" };
  if (partQuery) {
    partsResult = await lookupRepairDesk(partQuery);
    // attach recommendation metadata into invoice.raw for persistence
    invoice.raw = { ...invoice.raw, partRecommendation: { chosen: partsResult.recommended, fallback: partsResult.alternative, metaSource: partsResult.source } };
  }

  // persist invoice to Convex if available
  if (CONVEX_URL) {
    try {
      const client = new ConvexHttpClient(CONVEX_URL);
      const mutationFn = (api as any)?.invoices?.create || (api as any)?.invoices_create;
      if (!mutationFn) {
        console.warn("Convex invoices.create mutation not found; skipping persistence.");
      } else {
        await client.mutation(mutationFn, invoice);
      }
    } catch (err) {
      console.error("Convex save failed:", err);
      return NextResponse.json({ error: "Failed to persist invoice" }, { status: 500 });
    }
  }

  return NextResponse.json(
    { id: invoice.ticketId, recommended: partsResult.recommended, alternative: partsResult.alternative, partSource: partsResult.source },
    { status: 201 }
  );
}
