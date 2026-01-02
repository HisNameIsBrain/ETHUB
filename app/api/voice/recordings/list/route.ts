import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listRecordings } from "@/lib/voice/storage";
import { assertAllowedClientIp } from "@/lib/voice/config";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    assertAllowedClientIp(req);
    const recordings = await listRecordings(userId);
    return NextResponse.json({
      recordings: recordings.map(r => ({
        id: r.id,
        createdAt: r.createdAt,
        originalMime: r.originalMime,
        durationMs: r.durationMs,
        size: r.size,
        sha256: r.sha256
      }))
    });
  } catch (err: any) {
    const msg = err?.message || "Unable to list";
    const status = msg === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
