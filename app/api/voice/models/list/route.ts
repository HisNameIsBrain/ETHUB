import { NextRequest, NextResponse } from "next/server";
import { assertClientIpAllowed } from "@/lib/voice/config";
import { requireVoiceUser } from "@/lib/voice/auth";
import { listModels } from "@/lib/voice/storage";
import { toErrorResponse } from "@/lib/voice/errors";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    assertClientIpAllowed(req);
    const userId = requireVoiceUser();
    const models = await listModels(userId);
    return NextResponse.json({ models });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
