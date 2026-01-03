import { NextRequest, NextResponse } from "next/server";
import { assertClientIpAllowed, assertLocalVoiceService } from "@/lib/voice/config";
import { requireVoiceUser } from "@/lib/voice/auth";
import { getModel } from "@/lib/voice/storage";
import { synthesizeStubWav } from "@/lib/voice/audio";
import { VoiceError, toErrorResponse } from "@/lib/voice/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    assertClientIpAllowed(req);
    assertLocalVoiceService();
    const userId = requireVoiceUser();
    const body = await req.json();
    const { modelId, text } = body ?? {};

    if (!modelId || typeof modelId !== "string") {
      throw new VoiceError("modelId is required", 400, "voice_model_missing");
    }

    if (!text || typeof text !== "string") {
      throw new VoiceError("text is required", 400, "voice_text_missing");
    }

    const model = await getModel(userId, modelId);
    if (!model) {
      throw new VoiceError("Model not found", 404, "voice_model_not_found");
    }

    const audio = synthesizeStubWav(text);
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "no-store",
        "X-Voice-Model": model.id,
      },
    });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
