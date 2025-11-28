// app/api/tts/route.ts
import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // use Node runtime (Buffer etc. available)

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const text: string = body.text;
    const voice: string = body.voice || "alloy";
    const format: "mp3" | "opus" | "aac" | "flac" =
      body.format || "mp3";

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'text' in request body." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not set." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const speech = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice,
      input: text,
      format,
    });

    const audioBuffer = Buffer.from(await speech.arrayBuffer());

    // Content-Type based on format
    const mimeType =
      format === "mp3"
        ? "audio/mpeg"
        : format === "aac"
        ? "audio/aac"
        : format === "flac"
        ? "audio/flac"
        : "audio/ogg"; // opus

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(audioBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("TTS API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate speech.",
        detail: error?.message || String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

