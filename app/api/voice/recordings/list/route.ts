import { NextRequest, NextResponse } from "next/server";
import { assertClientIpAllowed } from "@/lib/voice/config";
import { requireVoiceUser } from "@/lib/voice/auth";
import { listRecordings } from "@/lib/voice/storage";
import { toErrorResponse } from "@/lib/voice/errors";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    assertClientIpAllowed(req);
    const userId = requireVoiceUser();
    const recordings = await listRecordings(userId);
    return NextResponse.json({ recordings });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
