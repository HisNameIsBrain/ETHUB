import { NextRequest, NextResponse } from "next/server";
import { assertClientIpAllowed } from "@/lib/voice/config";
import { requireVoiceUser } from "@/lib/voice/auth";
import { deleteRecording } from "@/lib/voice/storage";
import { VoiceError, toErrorResponse } from "@/lib/voice/errors";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  try {
    assertClientIpAllowed(req);
    const userId = requireVoiceUser();
    const body = await req.json();
    const recordingId = body?.recordingId;

    if (!recordingId || typeof recordingId !== "string") {
      throw new VoiceError("recordingId is required", 400, "voice_recording_missing");
    }

    await deleteRecording(userId, recordingId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
