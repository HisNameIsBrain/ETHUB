import { NextRequest, NextResponse } from "next/server";
import { assertClientIpAllowed } from "@/lib/voice/config";
import { requireVoiceUser } from "@/lib/voice/auth";
import { saveRecording } from "@/lib/voice/storage";
import { VoiceError, toErrorResponse } from "@/lib/voice/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    assertClientIpAllowed(req);
    const userId = requireVoiceUser();
    const formData = await req.formData();
    const recording = formData.get("recording");

    if (!(recording instanceof File)) {
      throw new VoiceError("Recording file is required", 400, "voice_file_missing");
    }

    const meta = await saveRecording(userId, recording);
    return NextResponse.json({ recording: meta });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
