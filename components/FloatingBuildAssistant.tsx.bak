"use client";

import { useState } from "react";
import { MessageSquareText, X, Send, Loader2 } from "lucide-react";

type Role = "user" | "assistant";
type Message = { role: Role; content: string };

const OLLAMA_BASE =
  process.env.NEXT_PUBLIC_OLLAMA_BASE_URL ?? "http://localhost:11434";

export default function FloatingBuildAssistant() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(&quot;&quot;);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: &quot;user&quot;, content: text };
    const history = [...messages, userMsg];

    setMessages(history);
    setInput(&quot;&quot;);
    setLoading(true);

    try {
      const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({
          model: &quot;llama3&quot;, // change to your ollama model
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          stream: false,
        }),
      });

      const data = await res.json();
      const replyText =
        data?.message?.content ??
        data?.message ??
        data?.response ??
        &quot;No response&quot;;

      setMessages((prev) => [...prev, { role: &quot;assistant&quot;, content: replyText }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: &quot;assistant&quot;, content: &quot;Error contacting Ollama.&quot; },
      ]);
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        aria-label="Open assistant"
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full border bg-background/70 shadow-lg hover:shadow-xl"
        onClick={() => setOpen(true)}
      >
        <MessageSquareText className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 overflow-hidden rounded-lg border bg-background shadow-xl">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageSquareText className="h-4 w-4" />
          Build Assistant
        </div>
        <button
          aria-label="Close assistant"
          className="rounded p-1 hover:bg-muted"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto p-3 text-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-primary-foreground"
                : "mr-auto max-w-[85%] rounded-lg bg-muted px-3 py-2"
            }
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex justify-center py-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>

      <form
        className="flex items-center gap-2 border-t p-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder=&quot;Ask something…&quot;
          className=&quot;flex-1 rounded-md border px-3 py-2 text-sm outline-none&quot;
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
