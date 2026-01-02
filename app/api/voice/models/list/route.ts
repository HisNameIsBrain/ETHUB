import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listModels } from "@/lib/voice/storage";
import { assertAllowedClientIp } from "@/lib/voice/config";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    assertAllowedClientIp(req);
    const models = await listModels(userId);
    return NextResponse.json({ models });
  } catch (err: any) {
    const msg = err?.message || "Unable to list models";
    const status = msg === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
