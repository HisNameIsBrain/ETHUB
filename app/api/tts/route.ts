// app/api/tts/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // needed for Buffer support

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text || "";
    const voice = body.voice || "alloy";
    const format = body.format || "mp3";

    if (!text.trim()) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // CHEAPEST MODEL HERE (tiny price per request)
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice,
      format,
      input: text,
    });

    // Convert ArrayBuffer → Node Buffer
    const arrayBuf = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          format === "mp3"
            ? "audio/mpeg"
            : format === "wav"
            ? "audio/wav"
            : "audio/ogg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
