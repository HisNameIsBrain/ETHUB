export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "./_generated/api";

const PAGE_SIZE = 10;
const TIMEOUT_MS = 8000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = (url.searchParams.get("search") ?? "").trim();
  const rawOffset = Number(url.searchParams.get("offset") ?? "0");
  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json(
      { items: [], nextOffset: null, total: 0, error: "Missing NEXT_PUBLIC_CONVEX_URL" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Defensive: verify functions exist in codegen
  const hasSearch = !!(api as any)?.services?.search;
  const hasCount  = !!(api as any)?.services?.count;
  if (!hasSearch || !hasCount) {
    return NextResponse.json(
      { items: [], nextOffset: null, total: 0, error: "Convex functions missing: services.search/count" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const client = new ConvexHttpClient(convexUrl);

    const [items, total] = await withTimeout(
      Promise.all([
        client.query(api.services.search, { q: search, offset, limit: PAGE_SIZE }),
        client.query(api.services.count, { q: search }),
      ]),
      TIMEOUT_MS
    );

    const nextOffset = offset + items.length >= total ? null : offset + PAGE_SIZE;

    return NextResponse.json(
      { items, nextOffset, total },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    const message = e?.message || "Server error";
    return NextResponse.json(
      { items: [], nextOffset: null, total: 0, error: message },
      { status: message === "timeout" ? 504 : 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
