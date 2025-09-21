import type { NextRequest } from "next/server";
import { NextRequest } from "next/server";
import { experimental_generateSpeech as generateSpeech } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const audio = await generateSpeech({
    model: openai.speech("gpt-4o-mini-tts"), // voice TTS model
    voice: "alloy",                          // pick a voice
    text,
  });
  return new Response(audio.toReadableStream(), {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
export const runtime = "edge";
export const dynamic = "force-dynamic";

// Health check: confirm middleware + routing are correct in browser
export async function GET() {
  return Response.json({ ok: true, route: "/api/tts" }, {
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "alloy", format = "mp3" } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response("Missing `text`", { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response("OPENAI_API_KEY not set", { status: 500 });

    const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: text,
        format, // "mp3" | "wav" | "ogg"
      }),
    });

    if (!upstream.ok) {
      // bubble up provider error text (JSON or text) to the client
      return new Response(await upstream.text(), { status: upstream.status });
    }

    const buf = await upstream.arrayBuffer();
    const contentType =
      format === "wav" ? "audio/wav" :
      format === "ogg" ? "audio/ogg" :
      "audio/mpeg";

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
