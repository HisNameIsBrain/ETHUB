import { NextRequest, NextResponse } from "next/server";
import { assertClientIpAllowed, assertLocalVoiceService } from "@/lib/voice/config";
import { requireVoiceUser } from "@/lib/voice/auth";
import { registerModel } from "@/lib/voice/storage";
import { toErrorResponse } from "@/lib/voice/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    assertClientIpAllowed(req);
    assertLocalVoiceService();
    const userId = requireVoiceUser();
    const body = await req.json();
    const modelName = body?.name || "My Voice";
    const sourceRecordingId = body?.recordingId;

    const model = await registerModel(userId, modelName, sourceRecordingId);
    return NextResponse.json({ model });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
