// app/api/seed/route.ts
import { NextResponse } from "next/server";
import { fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

/**
 * API endpoint for seeding Convex via seedPortalData.
 * You can call it with a POST from anywhere you trust.
 */
export async function POST() {
  try {
    const result = await fetchAction(api.actions.seedPortalData, {});
    return NextResponse.json({
      ok: true,
      message: `Seeded: ${result.insertedInventory} inventory parts and ${result.insertedParts} parts for ${result.device}`,
      result,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
