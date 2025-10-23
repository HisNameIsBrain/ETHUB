import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import api from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? "";
  try {
    const { results } = await convex.query(api.parts.search, { query });
    const [recommended, alternative] = results;
    return NextResponse.json({ recommended: recommended ?? null, alternative: alternative ?? null, results });
  } catch (err) {
    console.error("GET /api/parts error", err);
    return NextResponse.json({ recommended: null, alternative: null, results: [] }, { status: 200 });
  }
}
