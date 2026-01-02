import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModel } from "@/lib/voice/storage";
import { synthesizeStubWave } from "@/lib/voice/audio";
import { assertAllowedClientIp, assertLocalVoiceService } from "@/lib/voice/config";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    assertAllowedClientIp(req);
    assertLocalVoiceService();

    const body = await req.json();
    const modelId = body?.modelId as string;
    const prompt = body?.prompt as string;

    if (!modelId || typeof prompt !== "string") {
      return NextResponse.json({ error: "modelId and prompt are required" }, { status: 400 });
    }

    const model = await getModel(userId, modelId);
    if (!model) return NextResponse.json({ error: "Model not found" }, { status: 404 });
    if (model.status !== "ready") {
      return NextResponse.json({ error: "Model is not ready" }, { status: 400 });
    }

    const promptText = prompt.trim();
    if (!promptText) return NextResponse.json({ error: "Prompt is empty" }, { status: 400 });
    if (promptText.length > 50000) {
      return NextResponse.json({ error: "Prompt too long" }, { status: 400 });
    }

    const audio = synthesizeStubWave(promptText);
    const headers = new Headers({
      "Content-Type": "audio/wav",
      "Content-Disposition": `attachment; filename="voice-${modelId}.wav"`
    });
    return new NextResponse(audio, { status: 200, headers });
  } catch (err: any) {
    const msg = err?.message || "Synthesis failed";
    const status = msg === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
