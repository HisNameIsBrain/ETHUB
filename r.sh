#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Fixing Vercel AI SDK + route auth…"

# --- sanity ---
[ -f package.json ] || { echo "❌ Run from your project root (package.json not found)"; exit 1; }

# --- install deps ---
echo "📦 Installing ai @ai-sdk/openai"
npm install ai @ai-sdk/openai

# --- ensure env ---
touch .env.local
if ! grep -q '^OPENAI_API_KEY=' .env.local; then
  cat >> .env.local <<'ENV'

# === Vercel AI SDK ===
OPENAI_API_KEY=sk-REPLACE_ME
ENV
  echo "🗝  Added OPENAI_API_KEY placeholder to .env.local (put your real key)."
else
  echo "🗝  OPENAI_API_KEY already present in .env.local"
fi

# --- make /api/chat public in Clerk v5 middleware ---
if [ -f middleware.ts ]; then
  cp middleware.ts "middleware.ts.bak.$(date +%s)"
  # Add /api/chat(.*) to the public list if not present
  if ! grep -q '/api/chat' middleware.ts; then
    # Try to inject into createRouteMatcher([...])
    awk '
      BEGIN{done=0}
      /createRouteMatcher\(\[/ && !done {
        print; 
        getline; 
        print;
        while (index($0, "]") == 0) {
          if ($0 ~ /createRouteMatcher\(\[/) { print; next }
          print;
          getline;
        }
        print "  \"/api/chat(.*)\",";  # inject public chat route
        print;
        done=1;
        next
      }
      {print}
    ' middleware.ts.bak.* > middleware.ts 2>/dev/null || true
    # If awk approach failed, fall back to simple sed append near /api/public
    if ! grep -q '/api/chat' middleware.ts; then
      sed -i 's#"/api/public(.*)",#"/api/public(.*)",\n  "/api/chat(.*)",#' middleware.ts || true
    fi
    echo "✅ Marked /api/chat(.*) as public in middleware.ts"
  else
    echo "✅ /api/chat already public"
  fi
else
  echo "⚠️  No middleware.ts found; skipping public route injection."
fi

# --- create Edge route ---
api_route="app/api/chat/route.ts"
mkdir -p "$(dirname "$api_route")"
cat > "$api_route" <<'TS'
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response("Missing OPENAI_API_KEY", { status: 500 });
    }

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages,
    });

    return result.toAIStreamResponse();
  } catch (err: any) {
    console.error("AI route error:", err);
    return new Response(
      JSON.stringify({ error: String(err?.message || err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
TS
echo "📝 Wrote $api_route"

# --- minimal chat page ---
chat_page="app/chat/page.tsx"
mkdir -p "$(dirname "$chat_page")"
cat > "$chat_page" <<'TSX'
"use client";

import { useChat } from "ai/react";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
  });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">AI Chat</h1>

      <div className="mb-4 space-y-2 rounded border p-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">Start the conversation…</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className="leading-relaxed">
            <span className="mr-2 rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold">
              {m.role}
            </span>
            {m.content}
          </div>
        ))}
        {isLoading && <div className="text-sm text-gray-500">Thinking…</div>}
        {error && <div className="text-sm text-red-600">{String(error)}</div>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask me anything…"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
TSX
echo "📝 Wrote $chat_page"

# --- clean Next cache (helps after middleware edits) ---
rm -rf .next 2>/dev/null || true

echo
echo "✅ Done."
echo "Next steps:"
echo "  1) Put your real OPENAI_API_KEY in .env.local"
echo "  2) Restart dev: npm run dev"
echo "  3) Visit http://localhost:3000/chat"
echo
echo "If it still fails:"
echo "  • Check server logs for 'AI route error:' lines."
echo "  • Confirm middleware now lists '/api/chat(.*)' as public."
echo "  • Try a direct curl:"
echo "      curl -s -X POST localhost:3000/api/chat \\"
echo "        -H 'content-type: application/json' \\"
echo "        -d '{\"messages\":[{\"role\":\"user\",\"content\":\"hello\"}]}'"
