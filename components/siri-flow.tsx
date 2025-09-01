'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { SiriLoader } from '@/components/siri-loader';

export function SiriFlow() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [thinking, setThinking] = useState(false);

  // Listen for siri-bubble:open without any TS casts
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('siri-bubble:open', handler);
    return () => window.removeEventListener('siri-bubble:open', handler);
  }, []);

  // Simple backend call: stream-friendly route or your API
  const sendMessage = useMemo(
    () => async (text: string) => {
      setThinking(true);
      try {
        // Example: non-streaming POST (replace with your /api/chat streaming if desired)
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, { role: 'user', content: text }] }),
        });
        let reply = 'No reply.';
        try {
          const data = await res.json();
          reply = data.reply ?? reply;
        } catch {
          // if streaming, your UI would handle chunks instead
        }
        setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      } catch (e) {
        setMessages((m) => [...m, { role: 'assistant', content: 'Error contacting server.' }]);
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
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    await sendMessage(text);
  }

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] grid place-items-end bg-background/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="m-4 w-full max-w-lg rounded-2xl border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
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
              <li key={i} className={m.role === 'user' ? 'text-right' : ''}>
                <div
                  className={
                    'inline-block rounded-2xl px-3 py-2 ' +
                    (m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted')
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
    </div>,
    document.body
  );
}
