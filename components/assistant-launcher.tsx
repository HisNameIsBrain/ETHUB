"use client";

import React from "react";
import ReactDOM from "react-dom";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiriGlowInvert } from "@/components/siri-glow-invert";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { speakWithOpenAI } from "@/lib/tts";

// fine-tune training examples client-side
type Example = { prompt: string; completion: string };

const trainingExamples: Example[] = [
  {
    prompt: "Hi, I'm John Doe. My phone is an iPhone 12 Pro Max...",
    completion: "ID: IC-38\nService Status: Completed\nName: John Doe\n...",
  },
  // Add all other examples here as in your fine-tune code
];

export function downloadTrainingJSONL() {
  const lines = trainingExamples.map((ex) =>
    JSON.stringify({ prompt: ex.prompt + "\n\n###\n\n", completion: " " + ex.completion + "\n" })
  );
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "training.jsonl";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  console.log("Training JSONL downloaded (browser download).");
}

type Role = "system" | "user" | "assistant";
const CHAT_MODEL = "gpt-4o-mini" as const;
const TTS_VOICE = "alloy" as const;
const TTS_FORMAT = "mp3" as const;

export default function AssistantLauncher() {
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ role: Role; content: string }>>([]);

  const chatAction = useAction(api.openai.chat);
  const moderateAction = useAction(api.openai.moderate);

  React.useEffect(() => {
    const key = "__ETHUB_ASSISTANT_LAUNCHER__";
    if (window[key]) return;
    window[key] = true;
    setMounted(true);
    return () => delete window[key];
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);

    try {
      const mod = await moderateAction({ text });
      if (mod?.flagged) {
        setMessages((m) => [...m, { role: "assistant", content: "Sorry, I can’t help with that." }]);
        return;
      }

      const next = [...messages, { role: "user", content: text }];
      setMessages(next);

      const res = await chatAction({ model: CHAT_MODEL, messages: next as any });
      const output = typeof res?.content === "string" ? res.content : "";

      if (output) {
        setMessages((m) => [...m, { role: "assistant", content: output }]);
        await speakWithOpenAI(output, { voice: TTS_VOICE, format: TTS_FORMAT });
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { role: "assistant", content: "Something went sideways. Try again." }]);
    } finally {
      setInput("");
      setBusy(false);
    }
  }

  if (!mounted) return null;

  const launcherButton = (
    <button
      aria-label="Open Assistant"
      onClick={() => setOpen(true)}
      className="z-[95] fixed right-4 bottom-4 h-16 w-16 rounded-full relative overflow-hidden isolate grid place-items-center text-white shadow-lg"
    >
      <span className="absolute inset-0 rounded-full bg-neutral-950" />
      <SiriGlowInvert rotateSec={3.2} innerRotateSec={4.4} blurPx={14} insetPercent={-6} opacity={0.85} thicknessPx={11} inner colors={["rgba(255,242,0,0.9)", "rgba(255,138,0,0.9)","rgba(255,0,122,0.9)","rgba(122,0,255,0.9)","rgba(0,72,255,0.9)","rgba(0,162,255,0.9)","rgba(0,255,162,0.9)","rgba(160,255,0,0.9)"]}/>
      <span className="absolute inset-[3px] rounded-full bg-neutral-950/95 border border-white/10" />
      <div className="relative z-[1] h-3 w-3 rounded-full bg-white/90" />
    </button>
  );

  return (
    <>
      {ReactDOM.createPortal(launcherButton, document.body)}
      {open && (
        <div className="fixed inset-0 z-[96] bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="absolute bottom-0 right-0 m-4 w-[min(640px,calc(100vw-2rem))] rounded-2xl border bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="relative flex items-center justify-between p-3 border-b">
              <span className="font-medium">ETHUB Assistant</span>
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)}><X className="h-5 w-5" /></Button>
            </div>

            {/* Messages */}
            <div className="max-h-[40vh] overflow-auto p-3 space-y-3">
              {messages.filter((m) => m.role !== "system").map((m, i) => (
                <div key={i} className={`rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-blue-600 text-white" : "bg-black/55 text-white"}`}>
                  {m.content}
                </div>
              ))}
            </div>

            {/* Composer */}
            <form className="flex items-center gap-2 p-3 border-t" onSubmit={(e) => { e.preventDefault(); void send(); }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-md border px-3 py-2 text-sm bg-white/70 dark:bg-neutral-900/70 placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100"
                placeholder="Describe the issue…"
              />
              <Button type="submit" disabled={busy || !input.trim()} size="sm">Send</Button>
            </form>

            {/* Training export */}
            <div className="p-3 border-t">
              <Button onClick={downloadTrainingJSONL} size="sm" variant="outline">Export Training Data</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
