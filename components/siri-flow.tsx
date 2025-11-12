"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SiriLoader } from "@/components/siri-loader";

export function SiriFlow() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [thinking, setThinking] = useState(false);

  // anchor offsets computed from bubble DOM
  const [anchor, setAnchor] = useState<{ right: number; bottom: number; bubbleH: number }>({
    right: 24,
    bottom: 24,
    bubbleH: 56, // 14 * 4 (tailwind rem default 4px)
  });

  // open on custom event
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("siri-bubble:open", handler);
    return () => window.removeEventListener("siri-bubble:open", handler);
  }, []);

  // measure bubble position → compute exact offsets
  const measure = useMemo(
    () => () => {
      const el = document.getElementById("ai-bubble");
      if (!el) return;

      const r = el.getBoundingClientRect();
      // distance from bubble to viewport edges
      const right = Math.max(0, window.innerWidth - r.right);
      const bottom = Math.max(0, window.innerHeight - r.bottom);
      setAnchor({ right, bottom, bubbleH: r.height });
    },
    []
  );

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    const el = document.getElementById("ai-bubble");
    if (el) ro.observe(el);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [measure]);

  // simple backend call (replace with streaming if you like)
  const sendMessage = useMemo(
    () => async (text: string) => {
      setThinking(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...messages, { role: "user", content: text }] }),
        });
        let reply = "No reply.";
        try {
          const data = await res.json();
          reply = data.reply ?? reply;
        } catch {}
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
      } catch {
        setMessages((m) => [...m, { role: "assistant", content: "Error contacting server." }]);
      } finally {
        setThinking(false);
      }
    },
    [messages]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    await sendMessage(text);
  }

  if (!open) return null;

  const GAP = 8; // pixels between bubble and panel

  return createPortal(
    <div
      className="fixed inset-0 z-[999] bg-background/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      {/* absolutely position wrapper using measured offsets so it hugs the bubble */}
      <div
        className="pointer-events-none absolute w-full max-w-lg"
        style={{
          right: anchor.right,
          bottom: anchor.bottom + anchor.bubbleH + GAP,
        }}
      >
        <div
          className="pointer-events-auto ml-auto rounded-2xl border bg-background shadow-xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Assistant"
        >
          <header className="flex items-center justify-between px-4 py-3">
            <div className="font-medium">Assistant</div>
            <button
              className="rounded-md px-2 py-1 text-sm hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </header>

          <div className="max-h-[60vh] overflow-y-auto px-4 pb-2">
            <ul className="space-y-3">
              {messages.map((m, i) => (
                <li key={i} className={m.role === "user" ? "text-right" : ""}>
                  <div
                    className={
                      "inline-block rounded-2xl px-3 py-2 " +
                      (m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted")
                    }
                  >
                    {m.content}
                  </div>
                </li>
              ))}
              {thinking && (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <SiriLoader /> thinking…
                </li>
              )}
            </ul>
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 p-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              disabled={thinking}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
