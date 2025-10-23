import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api"; // <-- NAMED import (not default)

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? "";


  // 1) Try upstream (if configured)
  if (upstreamUrl && upstreamKey) {
    try {
      const r = await fetch(`${upstreamUrl}?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${upstreamKey}`, Accept: "application/json" },
        cache: "no-store",
      });
      if (r.ok) {
        const data = await r.json();
        return NextResponse.json(data);
      }
      // Log upstream error body for diagnostics
      const body = await r.text().catch(() => "");
      console.warn("Mobilesentrix upstream not OK:", r.status, body);
    } catch (e) {
      console.warn("Mobilesentrix upstream fetch failed:", e);
    }
  }

  // 2) Fallback to Convex dummy/seed data
  try {
    if (!convex) throw new Error("Convex client is not initialized.");
    if (!api?.parts?.search) {
      // This happens if you didn’t run `npx convex dev` or haven’t deployed the new function.
      throw new Error(
        "Convex API missing parts.search — run `npx convex dev` to regenerate `_generated/api` and `npx convex deploy`."
      );
    }

    const { results } = await convex.query(api.parts.search, { query });
    const [recommended, alternative] = results;
    return NextResponse.json({
      recommended: recommended ?? null,
      alternative: alternative ?? null,
      results,
    });
  } catch (err) {
    console.error("fallback convex error", err);
    // Still return 200 with empty data so UI doesn’t explode
    return NextResponse.json({ recommended: null, alternative: null, results: [] });
  }
}
