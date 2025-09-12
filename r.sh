#!/usr/bin/env bash
set -euo pipefail
echo "=== Wire chat send/receive (no schema edits) ==="

ROOT="$PWD"
mkdir -p "$ROOT/convex" "$ROOT/lib" "$ROOT/app/test-assistant"

# 1) Server: convex/openai.ts — always returns content; optional logs call guarded.
cat > "$ROOT/convex/openai.ts" <<'TS'
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

// Optional logs (if convex/logs.ts exists). Guarded so it never blocks.
let runLogs: (ctx: any, payload: any) => Promise<void> = async () => {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { api } = require("./_generated/api");
  runLogs = async (ctx, payload) => {
    try { await ctx.runMutation(api.logs.create, payload); } catch {}
  };
} catch {}

const ALLOWED = new Set(["gpt-4o-mini","gpt-4o","gpt-4.1","gpt-3.5-turbo"]);
const DEFAULT_MODEL = "gpt-4o-mini";

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function callOnce(model: string, messages: Msg[], key: string) {
  const client = new OpenAI({ apiKey: key });
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

    const preferred = (model && ALLOWED.has(model) ? model : undefined) ?? DEFAULT_MODEL;
    const tryOrder = Array.from(new Set([preferred, DEFAULT_MODEL]));
    const prompt = messages[messages.length - 1]?.content ?? "";
    const t0 = Date.now();

    let lastErr: any;
    for (const m of tryOrder) {
      try {
        const resp = await callOnce(m, messages as Msg[], key);
        const content = resp.choices?.[0]?.message?.content ?? "";
        const usage = resp.usage ?? { prompt_tokens: 0, completion_tokens: 0 };

        await runLogs(ctx, {
          userId: (await ctx.auth.getUserIdentity())?.subject,
          modelUsed: m,
          prompt,
          answer: content,
          ok: true,
          latencyMs: Date.now() - t0,
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
        });

        return { modelUsed: m, content }; // ✅ always return content
      } catch (e: any) {
        lastErr = e;
        const status = e?.status ?? e?.response?.status;
        const code = e?.code ?? e?.error?.code;

        await runLogs(ctx, {
          userId: (await ctx.auth.getUserIdentity())?.subject,
          modelUsed: m,
          prompt,
          ok: false,
          status,
          code,
          latencyMs: Date.now() - t0,
        });

        const downgradeable = status === 429 || status === 403 || code === "insufficient_quota";
        if (!downgradeable) throw e;
      }
    }
    return { modelUsed: preferred, content: "" }; // final fallback to avoid "(no reply)"
  },
});
TS
echo "✓ convex/openai.ts"

# 2) Client hook: lib/useAssistant.ts — echo user, await server, append assistant.
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
  const { debounceMs = 250, bucketCap = 5, bucketRefillPerMin = 5 } = opts;

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

      setHistory(h => [...h, { role: "user", content: prompt }]); // echo immediately

      setBusy(true);
      try {
        const res = await chat({ messages: [...history, { role: "user", content: prompt }], model });
        const content = (res as any)?.content ?? "";
        setHistory(h => [...h, { role: "assistant", content }]);
        return { content, modelUsed: (res as any)?.modelUsed };
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

# 3) Minimal test page for validation.
cat > "$ROOT/app/test-assistant/page.tsx" <<'TS'
"use client";
import * as React from "react";
import { useAssistant } from "@/lib/useAssistant";

const MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (default)" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4.1", label: "GPT-4.1" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

export default function TestAssistantPage() {
  const { history, busy, sendDebounced } = useAssistant();
  const [input, setInput] = React.useState("");
  const [model, setModel] = React.useState(MODELS[0].value);

  async function onSend() {
    const p = input.trim();
    if (!p) return;
    await sendDebounced(p, model);
    setInput("");
  }

  return (
    <div className="p-4 space-y-3 max-w-3xl mx-auto">
      <div className="flex gap-2">
        <select className="border rounded px-2 py-1" value={model} onChange={(e)=>setModel(e.target.value)}>
          {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Type a message"
          onKeyDown={(e)=>{ if(e.key==="Enter") onSend(); }}
        />
        <button className="px-3 py-2 rounded bg-black text-white disabled:opacity-50" onClick={onSend} disabled={busy}>
          {busy ? "…" : "Send"}
        </button>
      </div>

      <div className="border rounded p-3 space-y-2 max-h-[60vh] overflow-auto">
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
echo "Next:"
echo "  npx convex dev"
echo "  npx convex codegen"
echo "  pnpm dev"
echo "  Visit http://localhost:3000/test-assistant"
