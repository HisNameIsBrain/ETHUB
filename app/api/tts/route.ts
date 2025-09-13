// app/api/tts/route.ts
import OpenAI from "openai";

export async function POST(req: Request) {
  const { text, voice = "alloy", format = "mp3" } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response("OPENAI_API_KEY missing", { status: 500 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const speech = await client.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice,
    input: text,
    format, // "mp3" | "wav" | "ogg" | "pcm"
  });

  const buf = await speech.arrayBuffer();
  const mime =
    format === "wav"
      ? "audio/wav"
      : format === "ogg"
      ? "audio/ogg"
      : format === "pcm"
      ? "audio/wave" // browser-compatible PCM container
      : "audio/mpeg";

  return new Response(buf, { headers: { "content-type": mime } });
}
