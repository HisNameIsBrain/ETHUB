// components/assistant-launcher.tsx
"use client";

import * as React from "react";
import ReactDOM from "react-dom";
import { Bot, X, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiriGlowInvert } from "@/components/siri-glow-invert";
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
] as const;

const DEFAULT_MODEL = MODEL_OPTIONS[0].id as (typeof MODEL_OPTIONS)[number]["id"];

/* ---------- Small, flowing rainbow glow behind assistant bubbles ---------- */
function AIBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mr-auto max-w-[85%]">
      {/* Glow backdrop clipped to the bubble */}
      <div className="absolute -inset-2 -z-10 overflow-hidden rounded-3xl">
        <SiriGlowInvert
          className="absolute inset-0"
          rotateSec={16}
          innerRotateSec={22}
          blurPx={14}
          insetPercent={-6}
          opacity={0.28}
          thicknessPx={18}
          inner
          colors={[
            "rgba(255,242,0,0.95)",
            "rgba(255,138,0,0.95)",
            "rgba(255,0,122,0.95)",
            "rgba(122,0,255,0.95)",
            "rgba(0,72,255,0.95)",
            "rgba(0,162,255,0.95)",
            "rgba(0,255,162,0.95)",
            "rgba(160,255,0,0.95)",
          ]}
          style={{ willChange: "transform", transform: "translateZ(0)" }}
        />
        {/* gentle gloss for readability */}
        <div className="absolute inset-0 bg-white/12 backdrop-blur-[1.5px] mix-blend-overlay" />
      </div>

      <div className="rounded-2xl bg-black/55 text-white px-3 py-2 text-sm backdrop-blur">
        {children}
      </div>
    </div>
  );
}

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
      <SiriGlowInvert
        className="absolute inset-0"
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
  // Declare hooks before any returns (avoid hook order errors)
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const [model, setModel] = React.useState<string>(DEFAULT_MODEL);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ role: Role; content: string }>>([]);

  const [modelMenuOpen, setModelMenuOpen] = React.useState(true);
  const modelTouchedRef = React.useRef(false);

  // Speak replies toggle (persisted)
  const [speakReplies, setSpeakReplies] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("__speakReplies__") === "1";
  });
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("__speakReplies__", speakReplies ? "1" : "0");
    }
  }, [speakReplies]);

  // Optional mic (used if your "GPT-4o Voice" model is selected)
  const [audioStream, setAudioStream] = React.useState<MediaStream | null>(null);
  const mediaRef = React.useRef<MediaStream | null>(null);

  const chatAction = useAction(api.openai.chat);
  const askAction = useAction(api.openai.ask);
  const moderateAction = useAction(api.openai.moderate);

  // ensure single mount
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

  // auto-close model menu after a moment
  React.useEffect(() => {
    if (!open) return;
    setModelMenuOpen(true);
    modelTouchedRef.current = false;
    const t = setTimeout(() => {
      if (!modelTouchedRef.current) setModelMenuOpen(false);
    }, 2500);
    return () => clearTimeout(t);
  }, [open]);

  // mic controls (for visualizer / future VAD)
  const startMic = React.useCallback(async () => {
    if (mediaRef.current) return;
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRef.current = s;
    setAudioStream(s);
  }, []);
  const stopMic = React.useCallback(() => {
    mediaRef.current?.getTracks().forEach((t) => t.stop());
    mediaRef.current = null;
    setAudioStream(null);
  }, []);
  React.useEffect(() => () => stopMic(), [stopMic]);

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
      const mod = await moderateAction({ text });
      if (mod?.flagged) {
        setMessages((m) => [...m, { role: "assistant", content: "Blocked by moderation." }]);
        return;
      }

      // If speaking is on, we can map to a TTS-friendly model for /ask
      const wantsTTS = speakReplies;
      const chatModel = wantsTTS ? "gpt-4o-mini" : model;

      let res: any = null;

      if (useAsk) {
        res = await askAction({
          prompt: text,
          model: chatModel,
          voice: wantsTTS ? "alloy" : undefined,
          audioFormat: wantsTTS ? "mp3" : undefined,
        });
        const output = getTextFromResponse(res);
        if (output) {
          setMessages((m) => [
            ...m,
            { role: "user", content: text },
            { role: "assistant", content: output },
          ]);
          if (wantsTTS) await speakWithOpenAI(output, "alloy", "mp3");
        }
      } else {
        const next = [...messages, { role: "user", content: text }];
        setMessages(next);
        res = await chatAction({ model: chatModel, messages: next });
        const output = getTextFromResponse(res);
        if (output) {
          setMessages((m) => [...m, { role: "assistant", content: output }]);
          if (wantsTTS) await speakWithOpenAI(output, "alloy", "mp3");
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
  const voiceMode = model === "gpt-4o-mini-tts";
  const micActive = !!audioStream;

  return (
    <>
      {ReactDOM.createPortal(launcherButton, document.body)}

      {open && (
        <div className="fixed inset-0 z-[96] bg-black/40 backdrop-blur-sm">
          <div className="absolute bottom-0 right-0 m-4 w-[min(640px,calc(100vw-2rem))] rounded-2xl border bg-background shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-6 overflow-hidden rounded-full">
                  <SiriGlowInvert
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

              <div className="flex items-center gap-2">
                {/* speak replies toggle */}
                <button
                  type="button"
                  onClick={() => setSpeakReplies((v) => !v)}
                  aria-label={speakReplies ? "Disable speak replies" : "Enable speak replies"}
                  title={speakReplies ? "Disable speak replies" : "Enable speak replies"}
                  className={`relative h-9 w-9 grid place-items-center rounded-md border transition
                    ${speakReplies ? "bg-indigo-600/90 text-white border-indigo-500"
                                   : "bg-background hover:bg-accent"}`}
                >
                  <span className={`transition-transform duration-200 ${speakReplies ? "scale-110" : "scale-100"}`}>
                    {/* simple speaker icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H3v6h3l5 4V5z"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  </span>
                </button>

                {/* optional mic control (only relevant if using the Voice model) */}
                {voiceMode ? (
                  micActive ? (
                    <Button size="icon" variant="secondary" onClick={stopMic} title="Stop mic">
                      <MicOff className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="icon" onClick={startMic} title="Start mic">
                      <Mic className="h-4 w-4" />
                    </Button>
                  )
                ) : (
                  <Button size="icon" variant="outline" disabled title="Voice requires GPT-4o Voice">
                    <Mic className="h-4 w-4" />
                  </Button>
                )}

                <Button size="icon" variant="ghost" onClick={() => setOpen(false)} title="Close">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Inline model menu (mobile) */}
            {modelMenuOpen && (
              <div className="flex flex-wrap gap-2 p-3 border-b bg-muted/40 sm:hidden">
                {MODEL_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      modelTouchedRef.current = true;
                      setModel(m.id);
                    }}
                    className={`rounded-full px-3 py-1 text-sm border ${
                      model === m.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="max-h-[40vh] overflow-auto p-3 space-y-3">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ask me anything. Toggle 🔊 to hear replies aloud.
                </p>
              )}
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div
                    key={i}
                    className="rounded-lg px-3 py-2 text-sm bg-primary text-primary-foreground ml-auto max-w-[85%]"
                  >
                    {m.content}
                  </div>
                ) : (
                  <AIBubble key={i}>{m.content}</AIBubble>
                )
              )}
            </div>

            {/* Composer */}
            <form
              className="flex items-center gap-2 p-3 border-t"
              onSubmit={(e) => {
                e.preventDefault();
                void send(false);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-md border px-3 py-2 text-sm"
                placeholder="Type your question…"
              />
              <Button type="submit" disabled={busy}>
                {busy ? "…" : "Send"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void send(true)}
              >
                Ask (one-shot)
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
