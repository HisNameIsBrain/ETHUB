#!/usr/bin/env bash
set -euo pipefail

echo "=== ETHUB: Fix 'no reply' + server logging (Convex) ==="

ROOT="$PWD"

# 0) deps
if ! node -e "require.resolve('openai')" >/dev/null 2>&1; then
  if command -v pnpm >/dev/null 2>&1; then pnpm add openai@^4
  elif command -v npm  >/dev/null 2>&1; then npm i openai@^4
  else yarn add openai@^4; fi
fi

mkdir -p "$ROOT/convex" "$ROOT/lib"

# 1) Convex schema: add assistantLogs table (idempotent overwrite if you already manage schema; adjust if needed)
if [ -f "$ROOT/convex/schema.ts" ]; then
  cat > "$ROOT/convex/schema.ts.new" <<'TS'
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  assistantLogs: defineTable({
    userId: v.optional(v.string()),
    modelUsed: v.optional(v.string()),
    prompt: v.string(),
    answer: v.optional(v.string()),
    ok: v.boolean(),
    status: v.optional(v.number()),
    code: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    createdAt: v.number(),
  }),
});
TS
  mv "$ROOT/convex/schema.ts.new" "$ROOT/convex/schema.ts"
  echo "✓ convex/schema.ts"
fi

# 2) Convex logs mutation (create)
cat > "$ROOT/convex/logs.ts" <<'TS'
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    modelUsed: v.optional(v.string()),
    prompt: v.string(),
    answer: v.optional(v.string()),
    ok: v.boolean(),
    status: v.optional(v.number()),
    code: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("assistantLogs", {
      ...args,
      createdAt: Date.now(),
    });
    return true;
  },
});
TS
echo "✓ convex/logs.ts"

# 3) Convex OpenAI Action with fallback + server logging (writes to assistantLogs)
cat > "$ROOT/convex/openai.ts" <<'TS'
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const ALLOWED = new Set(["gpt-4.1","gpt-4o","gpt-4o-mini","gpt-3.5-turbo"]);
const CHEAP_DEFAULT = "gpt-4o-mini";

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function callOnce(model: string, messages: Msg[], apiKey: string) {
  const client = new OpenAI({ apiKey });
  return client.chat.completions.create({ model, messages });
}

export const chat = action({
  args: {
    messages: v.array(v.object({
      role: v.union(v.literal("system"), v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
    model: v.optional(v.string()),
  },
  handler: async (ctx, { messages, model }) => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("Missing OPENAI_API_KEY");

    const userId = (await ctx.auth.getUserIdentity())?.subject ?? undefined;
    const preferred = (model && ALLOWED.has(model) ? model : undefined) ?? CHEAP_DEFAULT;
    const tryOrder = Array.from(new Set([preferred, CHEAP_DEFAULT]));

    const prompt = messages[messages.length - 1]?.content ?? "";
    const t0 = Date.now();

    let lastErr: any = null;
    for (const m of tryOrder) {
      try {
        const resp = await callOnce(m, messages as Msg[], key);
        const content = resp.choices[0]?.message?.content ?? "";
        const latencyMs = Date.now() - t0;
        await ctx.runMutation("logs:create", {
          userId, modelUsed: m, prompt, answer: content, ok: true, latencyMs,
        });
        return { modelUsed: m, content };
      } catch (e: any) {
        lastErr = e;
        const status = e?.status ?? e?.response?.status;
        const code = e?.code ?? e?.error?.code;
        const latencyMs = Date.now() - t0;
        const downgradeable = status === 429 || status === 403 || code === "insufficient_quota";
        await ctx.runMutation("logs:create", {
          userId, modelUsed: m, prompt, ok: false, status, code, latencyMs,
        });
        if (!downgradeable) throw e;
      }
    }
    throw new Error(`OpenAI fallback exhausted: ${lastErr?.message || "unknown"}`);
  },
});
TS
echo "✓ convex/openai.ts"

# 4) Model options for UI
cat > "$ROOT/lib/openaiModels.ts" <<'TS'
export const OPENAI_MODEL_OPTIONS = [
  { value: "gpt-4o-mini", label: "GPT-4o mini (default)" },
  { value: "gpt-4o",      label: "GPT-4o" },
  { value: "gpt-4.1",     label: "GPT-4.1" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (legacy)" },
] as const;
TS
echo "✓ lib/openaiModels.ts"

# 5) Client hook: fixes 'no reply' (user echo + awaited call), includes debounce + token bucket; removes external analytics
cat > "$ROOT/lib/useAssistant.ts" <<'TS'
"use client";
import * as React from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

type Msg = { role: "system" | "user" | "assistant"; content: string };
type SendResult = { content: string; modelUsed?: string } | { blocked: true };

export function useAssistant(opts: {
  debounceMs?: number;
  bucketCap?: number;
  bucketRefillPerMin?: number;
} = {}) {
  const { debounceMs = 300, bucketCap = 5, bucketRefillPerMin = 5 } = opts;

  const chat = useAction(api.openai.chat);
  const [busy, setBusy] = React.useState(false);
  const [history, setHistory] = React.useState<Msg[]>([]);

  const bucketRef = React.useRef({ tokens: bucketCap, last: Date.now() });
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function takeToken() {
    const now = Date.now();
    const elapsed = now - bucketRef.current.last;
    bucketRef.current.tokens = Math.min(
      bucketCap,
      bucketRef.current.tokens + (elapsed / 60000) * bucketRefillPerMin
    );
    bucketRef.current.last = now;
    if (bucketRef.current.tokens >= 1) { bucketRef.current.tokens -= 1; return true; }
    return false;
  }

  const send = React.useCallback(
    async (prompt: string, model?: string): Promise<SendResult> => {
      if (busy) return { blocked: true };
      if (!takeToken()) return { blocked: true };

      setHistory(h => [...h, { role: "user", content: prompt }]);  // user echo

      setBusy(true);
      try {
        const res = await chat({ messages: [...history, { role: "user", content: prompt }], model });
        setHistory(h => [...h, { role: "assistant", content: res.content }]);
        return { content: res.content, modelUsed: (res as any).modelUsed };
      } finally {
        setBusy(false);
      }
    },
    [busy, chat, history, bucketCap, bucketRefillPerMin]
  );

  const sendDebounced = React.useCallback(
    (prompt: string, model?: string) =>
      new Promise<SendResult>((resolve, reject) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          send(prompt, model).then(resolve).catch(reject);
        }, debounceMs);
      }),
    [send, debounceMs]
  );

  return { busy, history, send, sendDebounced };
}
TS
echo "✓ lib/useAssistant.ts"

# 6) Optional minimal test page to validate end-to-end quickly
mkdir -p "$ROOT/app/test-assistant"
cat > "$ROOT/app/test-assistant/page.tsx" <<'TS'
"use client";
import * as React from "react";
import { useAssistant } from "@/lib/useAssistant";
import { OPENAI_MODEL_OPTIONS } from "@/lib/openaiModels";

export default function Page() {
  const { history, busy, sendDebounced } = useAssistant();
  const [input, setInput] = React.useState("");
  const [model, setModel] = React.useState(OPENAI_MODEL_OPTIONS[0].value);

  async function onSend() {
    const p = input.trim();
    if (!p) return;
    await sendDebounced(p, model);
    setInput("");
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <select value={model} onChange={(e)=>setModel(e.target.value)} className="border rounded px-2 py-1">
          {OPENAI_MODEL_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <input className="flex-1 border rounded px-3 py-2" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Say hi" />
        <button onClick={onSend} disabled={busy} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
          {busy ? "…" : "Send"}
        </button>
      </div>
      <div className="border rounded p-3 space-y-2 max-h-80 overflow-auto">
        {history.map((m,i)=>(
          <div key={i}><strong>{m.role==="user"?"User":"Assistant"}:</strong> {m.content || "(no reply)"}</div>
        ))}
      </div>
    </div>
  );
}
TS
echo "✓ app/test-assistant/page.tsx"

echo
echo "=== Next steps ==="
echo "1) npx convex env set OPENAI_API_KEY \"\$OPENAI_API_KEY\""
echo "2) npx convex dev    # in one terminal (will prompt to migrate if schema changed)"
echo "3) npx convex codegen"
echo "4) pnpm dev          # or npm run dev"
echo "5) Visit /test-assistant and send a message."
