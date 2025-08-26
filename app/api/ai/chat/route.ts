// app/api/chat/route.ts
import { NextRequest } from "next/server";

/**
 * Simple Ollama proxy for Vercel AI SDK `useChat`
 * No API keys are required, Ollama runs locally.
 */
export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // forward to Ollama API
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || "llama3", // default to llama3
      messages,
      stream: true,
    }),
  });

  // stream results back to client
  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
