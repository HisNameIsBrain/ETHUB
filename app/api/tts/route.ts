// app/api/tts/route.ts
import { NextResponse } from "next/server";

const GEMINI_TTS_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateSpeech";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY env var");
      return NextResponse.json(
        { error: "Server misconfiguration: GEMINI_API_KEY not set" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.text !== "string" || !body.text.trim()) {
      return NextResponse.json(
        { error: "Missing 'text' in request body" },
        { status: 400 }
      );
    }

    const text: string = body.text;
    const voice: string | undefined = body.voice;

    // Accept "mp3" / "audio/mp3" / "ogg" / "audio/ogg"
    const rawFormat: string | undefined = body.format;
    const format: "audio/mp3" | "audio/ogg" =
      rawFormat === "mp3" || rawFormat === "audio/mp3"
        ? "audio/mp3"
        : "audio/ogg";

    const payload = {
      input: { text },
      outputConfig: {
        mimeType: format,
      },
      voiceConfig: {
        // Use Gemini voice name, client can override
        voice: voice || "Charon",
      },
    };

    const response = await fetch(`${GEMINI_TTS_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      console.error("Gemini TTS error:", response.status, errorJson);
      return NextResponse.json(
        {
          error: "Gemini TTS request failed",
          status: response.status,
          details: errorJson,
        },
        { status: 500 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": format,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Gemini TTS route error:", err);
    return NextResponse.json(
      { error: "Internal server error in TTS route" },
      { status: 500 }
    );
  }
}
