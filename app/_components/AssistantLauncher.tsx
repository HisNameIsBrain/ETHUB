"use client";

import * as React from "react";
import ReactDOM from "react-dom";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiriGlowRingInvert } from "@/components/siri-glow-invert";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { speakWithOpenAI } from "@/lib/tts";

type Role = "system" | "user" | "assistant";

const MODEL_OPTIONS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini" },
  { id: "gpt-4.1", label: "GPT-4.1" },
  { id: "o3-mini", label: "o3 mini" },
  { id: "gpt-4o-mini-tts", label: "GPT-4o Voice" },
];

const DEFAULT_MODEL = MODEL_OPTIONS[0].id;

function LauncherButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      aria-label="Open Assistant"
      onClick={onOpen}
      className="z-[95] h-16 w-16 rounded-full relative overflow-hidden isolate grid place-items-center text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
      style={{
        position: "fixed",
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <span className="absolute inset-0 rounded-full bg-neutral-950" />
      <SiriGlowRingInvert
        className="inset-[-6%]"
        rotateSec={3.2}
        innerRotateSec={4.4}
        blurPx={14}
        insetPercent={-6}
        opacity={0.85}
        thicknessPx={11}
        inner
        colors={[
          "rgba(255,242,0,0.9)",
          "rgba(255,138,0,0.9)",
          "rgba(255,0,122,0.9)",
          "rgba(122,0,255,0.9)",
          "rgba(0,72,255,0.9)",
          "rgba(0,162,255,0.9)",
          "rgba(0,255,162,0.9)",
          "rgba(160,255,0,0.9)",
        ]}
      />
      <span className="absolute inset-[3px] rounded-full bg-neutral-950/95 border border-white/10" />
      <Bot className="relative z-[1] h-7 w-7" />
    </button>
  );
}

export default function AssistantLauncher() {
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const [model, setModel] = React.useState<string>(DEFAULT_MODEL);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ role: Role; content: string }>>([]);

  const [modelMenuOpen, setModelMenuOpen] = React.useState(true);
  const modelTouchedRef = React.useRef(false);

  const chatAction = useAction(api.openai.chat);
  const askAction = useAction(api.openai.ask);
  const moderateAction = useAction(api.openai.moderate);

  React.useEffect(() => {
    const key = "__ETHUB_ASSISTANT_LAUNCHER__";
    // @ts-ignore
    if (window[key]) return;
    // @ts-ignore
    window[key] = true;
    setMounted(true);
    return () => {
      // @ts-ignore
      delete window[key];
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setModelMenuOpen(true);
    modelTouchedRef.current = false;
    const t = setTimeout(() => {
      if (!modelTouchedRef.current) setModelMenuOpen(false);
    }, 2500);
    return () => clearTimeout(t);
  }, [open]);

  function getTextFromResponse(res: any): string {
    if (!res) return "";
    if (typeof res.content === "string") return res.content;
    if (typeof res.text === "string") return res.text;
    return "";
  }

  async function send(useAsk = false) {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const mod = await moderateAction({ input: text });
      if (mod?.flagged) {
        setMessages((m) => [...m, { role: "assistant", content: "Blocked by moderation." }]);
        return;
      }

      const voiceWanted = model === "gpt-4o-mini-tts";
      const chatModel = voiceWanted ? "gpt-4o-mini" : model;

      let res: any = null;

      if (useAsk) {
        res = await askAction({
          prompt: text,
          model: chatModel,
          voice: voiceWanted ? "alloy" : undefined,
          audioFormat: voiceWanted ? "mp3" : undefined,
        });
        const output = getTextFromResponse(res);
        if (output) {
          setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: output }]);
          if (voiceWanted) {
            await speakWithOpenAI(output, "alloy", "mp3");
          }
        }
      } else {
        const next = [...messages, { role: "user", content: text }];
        setMessages(next);
        res = await chatAction({ model: chatModel, messages: next });
        const output = getTextFromResponse(res);
        if (output) {
          setMessages((m) => [...m, { role: "assistant", content: output }]);
          if (voiceWanted) {
            await speakWithOpenAI(output, "alloy", "mp3");
          }
        }
      }
    } catch (err) {
      console.error("Assistant error:", err);
      setMessages((m) => [...m, { role: "assistant", content: "Error talking to assistant." }]);
    } finally {
      setInput("");
      setBusy(false);
    }
  }

  if (!mounted) return null;

  const launcherButton = <LauncherButton onOpen={() => setOpen(true)} />;

  return (
    <>
      {ReactDOM.createPortal(launcherButton, document.body)}

      {open && (
        <div className="fixed inset-0 z-[96] bg-black/40 backdrop-blur-sm">
          <div className="absolute bottom-0 right-0 m-4 w-[min(640px,calc(100vw-2rem))] rounded-2xl border bg-background shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-6 overflow-hidden rounded-full">
                  <SiriGlowRingInvert
                    rotateSec={3.6}
                    innerRotateSec={4.6}
                    blurPx={10}
                    insetPercent={-4}
                    opacity={0.8}
                    thicknessPx={8}
                    inner
                  />
                  <span className="absolute inset-[2px] rounded-full border border-white/30 bg-black/50" />
                </div>
                <span className="font-medium">ETHUB Assistant</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className={`transition-[max-height,opacity] ${modelMenuOpen ? "max-h-28 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
              <div className="flex flex-wrap gap-2 p-3 border-b bg-muted/40">
                {MODEL_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { modelTouchedRef.current = true; setModel(m.id); }}
                    className={`rounded-full px-3 py-1 text-sm border ${
                      model === m.id ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[40vh] overflow-auto p-3 space-y-3">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ask me anything. Choose “GPT-4o Voice” to hear replies spoken aloud.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    m.role === "user" ? "bg-primary text-primary-foreground ml-auto max-w-[85%]" : "bg-muted mr-auto max-w-[85%]"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>

            <form
              className="flex items-center gap-2 p-3 border-t"
              onSubmit={(e) => { e.preventDefault(); void send(false); }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-md border px-3 py-2 text-sm"
                placeholder="Type your question…"
              />
              <Button type="submit" disabled={busy}>{busy ? "…" : "Send"}</Button>
              <Button type="button" variant="secondary" disabled={busy} onClick={() => void send(true)}>
                Ask (one-shot)
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
