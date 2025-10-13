// app/api/portal/prices/route.ts
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";

  try {
    const prices = await convex.query(api.partsPrice.getPartPrices, { query });
    return NextResponse.json(prices);
  } catch (err) {
    console.error("Convex getPartPrices failed", err);
    return NextResponse.json({ error: "Failed to fetch Convex prices" }, { status: 500 });
  }
}
