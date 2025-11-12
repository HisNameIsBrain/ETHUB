// app/api/mobilesentrix/prices/route.ts
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexReactClient } from "convex/react"; // for serverless, prefer HTTP client
import { ConvexHttpClient } from "convex/browser"; // works in Next server runtime too

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function getEnv(name: string) {
  const v = process.env[name];
  return v && v.trim().length ? v.trim() : undefined;
}

function normalize(query: string, vendorItems: any[]): any[] {
  // Map whatever vendor returns to your card model
  return (vendorItems ?? []).map((it) => {
    const part = Number(it?.price ?? it?.partPrice ?? 0) || undefined;
    const labor = Number(it?.labor ?? 0) || undefined;
    const total = typeof part === "number" && typeof labor === "number" ? part + labor : part ?? labor ?? undefined;

    return {
      query,
      title: String(it?.title ?? it?.name ?? "Part"),
      device: it?.device ?? undefined,
      partPrice: part,
      labor,
      total,
      type: it?.tier ?? it?.type ?? undefined,          // e.g., "Premium"/"Economical"
      eta: it?.eta ?? it?.installTime ?? undefined,     // e.g., "≈ 2 hours install"
      image: it?.image ?? it?.img ?? undefined,
      source: "MobileSentrix",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("query")?.trim();
  if (!query) return NextResponse.json({ error: "Missing `query`" }, { status: 400 });

  const upstreamUrl = getEnv("MS_UPSTREAM_URL");
  const upstreamKey = getEnv("MS_UPSTREAM_KEY");

  // Default: empty results but not a 500
  let results: any[] = [];

  if (upstreamUrl && upstreamKey) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    try {
      const r = await fetch(`${upstreamUrl}?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${upstreamKey}`, Accept: "application/json" },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(t);
      if (r.ok) {
        const data = await r.json();
        const vendorItems = Array.isArray((data as any)?.results) ? (data as any).results : Array.isArray(data) ? data : [];
        results = normalize(query, vendorItems);
      } else {
        results = [];
      }
    } catch {
      // keep results = []
    }
  }

  // Optional: cache in Convex if you have a server key, otherwise skip
  try {
    const convexUrl = getEnv("CONVEX_URL");
    const adminKey = getEnv("CONVEX_ADMIN_KEY"); // server-only
    if (convexUrl && adminKey && results.length) {
      const convex = new ConvexHttpClient(convexUrl, { adminAuth: adminKey });
      await convex.mutation(api.parts.cacheBundle, {
        query,
        results,
        images: [],
      });
    }
  } catch {
    // non-fatal
  }

  return NextResponse.json({ ok: true, query, results }, { status: 200 });
}
