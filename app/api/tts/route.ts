// app/api/tts/route.ts
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type BodyIn = { text?: string; voice?: string; format?: "mp3"|"wav"|"ogg"; model?: string };

const contentType = (f: string) =>
  f === "wav" ? "audio/wav" : f === "ogg" ? "audio/ogg" : "audio/mpeg";

async function callOpenAITts({ text, voice, format, model, apiKey }: {
  text: string; voice: string; format: "mp3"|"wav"|"ogg"; model: string; apiKey: string;
}) {
  // Single upstream call; the caller can retry this wrapper
  return fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, voice, input: text, format }),
  });
}

export async function POST(req: NextRequest) {
  // Parse body safely
  let body: BodyIn = {};
  try { body = (await req.json()) as BodyIn; } catch {}
  const text   = (body.text ?? "").trim();
  const voice  = (body.voice ?? "alloy").trim();
  const format = (body.format ?? "mp3") as "mp3"|"wav"|"ogg";
  const model  = (body.model ?? "gpt-4o-mini-tts").trim();

  if (!text) return Response.json({ error: "Missing `text`" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });

  // Minimal retry for transient edge/upstream failures
  let lastErrText: string | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const upstream = await callOpenAITts({ text, voice, format, model, apiKey });
    if (upstream.ok && upstream.body) {
      // Stream directly to the client: avoids buffering timeouts
      return new Response(upstream.body, {
        status: 200,
        headers: {
          "content-type": contentType(format),
          "cache-control": "no-store",
        },
      });
    }
    lastErrText = await upstream.text();
    // Retry only on likely-transient errors
    if (![408, 409, 425, 429, 499, 500, 502, 503, 504].includes(upstream.status)) {
      try {
        const json = JSON.parse(lastErrText);
        return Response.json(json, { status: upstream.status });
      } catch {
        return Response.json({ error: lastErrText.slice(0, 1000) }, { status: upstream.status });
      }
    }
    // small backoff
    await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
  }

  // Give best error after retries
  try {
    const json = JSON.parse(lastErrText ?? "");
    return Response.json(json, { status: 502 });
  } catch {
    return Response.json({ error: (lastErrText ?? "terminated") }, { status: 502 });
  }
}

export async function GET() {
  return Response.json({ ok: true, route: "/api/tts", runtime, dynamic }, { headers: { "cache-control": "no-store" } });
}
