import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const GOOGLE_API = "https://www.googleapis.com/customsearch/v1";

/**
 * GET /api/image-search?query=...&num=4
 *
 * 1) If Convex has cached images for this query, return them.
 * 2) Otherwise call Google CSE, save results to Convex, and return them.
 *
 * Requires:
 * - GOOGLE_CSE_API_KEY
 * - GOOGLE_CSE_CX
 * - NEXT_PUBLIC_CONVEX_URL (Convex HTTP endpoint) — used by ConvexHttpClient here.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("query") ?? "";
    const num = Math.min(Number(url.searchParams.get("num") ?? "4"), 10);

    if (!q) {
      return NextResponse.json({ error: "missing query" }, { status: 400 });
    }

    // Convex client (HTTP)
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;
    if (!convexUrl) {
      console.warn("NEXT_PUBLIC_CONVEX_URL not set — will not use convex caching");
    }

    const client = convexUrl ? new ConvexHttpClient(convexUrl) : null;

    // 1) Check cache
    if (client) {
      try {
        const cached = await client.query(api.partImages.getCachedImages, { query: q });
        if (cached && cached.length > 0) {
          return NextResponse.json({ images: cached });
        }
      } catch (e) {
        console.warn("Convex getCachedImages failed:", e);
      }
    }

    // 2) Fetch from Google CSE
    const key = process.env.GOOGLE_CSE_API_KEY;
    const cx = process.env.GOOGLE_CSE_CX;
    if (!key || !cx) {
      return NextResponse.json({ error: "server misconfigured: missing GOOGLE_CSE_API_KEY or GOOGLE_CSE_CX" }, { status: 500 });
    }

    const params = new URLSearchParams({
      key,
      cx,
      q,
      searchType: "image",
      num: String(num),
    });

    const res = await fetch(`${GOOGLE_API}?${params.toString()}`, { method: "GET" });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Google CSE error:", res.status, body);
      return NextResponse.json({ error: "image search failed", status: res.status, body }, { status: 502 });
    }

    const json = await res.json();
    const images = (json.items ?? []).map((it: any) => ({
      link: it.link,
      title: it.title,
      mime: it.mime,
      contextLink: it.image?.contextLink ?? null,
      thumbnail: it.image?.thumbnailLink ?? null,
    }));

    // save to Convex cache if client available
    if (client && images.length > 0) {
      try {
        await client.mutation(api.partImages.saveImages, { query: q, images });
      } catch (e) {
        console.warn("Convex saveImages failed:", e);
      }
    }

    return NextResponse.json({ images });
  } catch (err) {
    console.error("image-search route error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
