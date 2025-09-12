"use client";

import * as React from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiriBubbleButton } from "@/components/siri-bubble-button";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

const OPENAI_MODEL_OPTIONS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (fast)" },
  { value: "gpt-4o", label: "GPT-4o (balanced)" },
  { value: "gpt-4.1", label: "GPT-4.1 (latest)" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (legacy)" },
];

export default function AssistantLauncher() {
  const [open, setOpen] = React.useState(false);
  const [model, setModel] = React.useState<string>(() =>
    (typeof window !== "undefined" && localStorage.getItem("assistant:model")) || "gpt-4o-mini"
  );
  const [messages, setMessages] = React.useState<ChatMsg[]>([
    { role: "system", content: "You are a concise, helpful assistant for ETHUB." },
  ]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const chat = useAction(api.openai.chat);

  React.useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("assistant:model", model);
  }, [model]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);

    try {
      const res = await chat({ model, messages: next });
      setMessages((prev) => [...prev, { role: "assistant", content: res.text || "(no reply)" }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${e?.message ?? "request failed"}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Model picker */}
      <Select value={model} onValueChange={setModel}>
        <SelectTrigger className="h-8 w-[220px]">
          <SelectValue placeholder="Choose a model" />
        </SelectTrigger>
        <SelectContent align="end">
          {OPENAI_MODEL_OPTIONS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Launcher button */}
      <SiriBubbleButton
        aria-label="Open assistant"
        onClick={handleOpen}
        className="group grid h-14 w-14 place-items-center rounded-full border bg-background/70 shadow-md"
      >
        <span className="sr-only">Open assistant</span>
        {/* put your ring/glow/icon here */}
      </SiriBubbleButton>

      {/* Simple modal */}
      {open && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/40"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-background p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-lg font-medium">Assistant</div>
              <div className="text-xs text-muted-foreground">{model}</div>
            </div>

            <div className="mb-2 h-64 overflow-y-auto rounded border p-2">
              {messages
                .filter((m) => m.role !== "system")
                .map((m, i) => (
                  <div key={i} className="mb-2 text-sm">
                    <b className="capitalize">{m.role}:</b> {m.content}
                  </div>
                ))}
            </div>

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 rounded border px-2 py-1 text-sm"
                placeholder={`Ask with ${model}...`}
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={sending}
                className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
