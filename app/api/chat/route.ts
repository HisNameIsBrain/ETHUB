// app/api/chat/route.ts
import type { NextRequest } from "next/server";

export const runtime = "nodejs"; // needed if you call localhost in dev

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function jsonSSE(response: Response) {
  // Pass through upstream SSE stream as-is
  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Prefer Ollama if configured (local dev), else OpenAI
    const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
    const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

    // If you explicitly set OLLAMA_URL, try Ollama first
    const useOllama = !!process.env.OLLAMA_URL || (!OPENAI_KEY && OLLAMA_URL);

    if (useOllama) {
      // Ollama chat streaming (SSE-like NDJSON/lines) — Vercel useChat can consume it
      const upstream = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages,
          stream: true,
        }),
      });

      if (!upstream.ok) {
        // Fall back to OpenAI if available
        if (OPENAI_KEY) {
          return await streamOpenAI(messages, OPENAI_KEY, OPENAI_MODEL);
        }
        return new Response(
          JSON.stringify({ error: `Ollama error: ${upstream.statusText}` }),
          {
            status: upstream.status,
            headers: { "content-type": "application/json" },
          },
        );
      }

      return jsonSSE(upstream);
    }

    // Default: OpenAI streaming
    return await streamOpenAI(messages, OPENAI_KEY!, OPENAI_MODEL);
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Server error" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}

async function streamOpenAI(
  messages: ChatMessage[],
  apiKey: string,
  model: string,
) {
  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages,
    }),
  });

  if (!upstream.ok) {
    return new Response(
      JSON.stringify({ error: `OpenAI error: ${upstream.statusText}` }),
      {
        status: upstream.status,
        headers: { "content-type": "application/json" },
      },
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
