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
