// components/assistant-launcher.tsx
"use client";

import * as React from "react";
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

  const [audioStream, setAudioStream] = React.useState<MediaStream | null>(null);
  const mediaRef = React.useRef<MediaStream | null>(null);

  const chatAction = useAction(api.openai.chat);
  const askAction = useAction(api.openai.ask);
  const moderateAction = useAction(api.openai.moderate);

  // ensure single mount
  React.useEffect(() => {
    const key = "__ETHUB_ASSISTANT_LAUNCHER__";
    if ((window as any)[key]) return;
    (window as any)[key] = true;
    setMounted(true);
    return () => {
      delete (window as any)[key];
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

  // publish model + audioStream globally for VoiceVisualizerGate
  React.useEffect(() => {
    const w = globalThis as any;
    w.__assistantState = { ...(w.__assistantState || {}), model, audioStream };
    w.__onAssistantStateChange =
      w.__onAssistantStateChange ||
      ((cb: (s: any) => void) => {
        (w.__assistantSubscribers ||= new Set()).add(cb);
        return () => (w.__assistantSubscribers as Set<Function>).delete(cb);
      });
    (w.__assistantSubscribers as Set<Function> | undefined)?.forEach((cb) =>
      cb(w.__assistantState)
    );
    (w as any).VoiceVisualizerComponent =
      (w as any).VoiceVisualizerComponent || undefined;
  }, [model, audioStream]);

  // mic controls (for visualizer and future VAD)
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
    // Convex action might return { message: { content: string } }
    if (res.message && typeof res.message.content === "string") return res.message.content;
    return "";
  }

  async function send(useAsk = false) {
    const text = input.trim();
    if (!text || busy) return;

    // Add the user message immediately for UI responsiveness.
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);

    try {
      // 1) Moderation
      const mod = await moderateAction({ text });
      if (mod?.flagged) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Blocked by moderation." },
        ]);
        return;
      }

      // 2) Pick model: if voice is selected, use a text model for reasoning
      const voiceWanted = model === "gpt-4o-mini-tts";
      const chatModel = voiceWanted ? "gpt-4o-mini" : model;

      // 3) Ask model via Convex actions
      let res: any;
      if (useAsk) {
        res = await askAction({ model: chatModel, prompt: text });
      } else {
        const history = [...messages, { role: "user", content: text }];
        res = await chatAction({ model: chatModel, messages: history });
      }

      const assistantText = getTextFromResponse(res) || "(no response)";
      setMessages((m) => [...m, { role: "assistant", content: assistantText }]);

      // 4) Speak (if the Voice model is selected)
      if (voiceWanted) {
        try {
          const url = await speakWithOpenAI({
            text: assistantText,
            voice: "alloy",
            format: "mp3",
          });
          const audio = new Audio(url);
          audio.onended = () => URL.revokeObjectURL(url);
          // Important: this is still within the button click stack (user gesture),
          // so most browsers will allow playback.
          await audio.play();
        } catch (e: any) {
          console.error("TTS error:", e);
          setMessages((m) => [
            ...m,
            { role: "assistant", content: `TTS error: ${e?.message ?? e}` },
          ]);
        }
      }
    } catch (e: any) {
      console.error(e);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Error: ${e?.message ?? String(e)}` },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!mounted) return null;

  return (
    <>
      <LauncherButton onOpen={() => setOpen(true)} />
      {open && (
        <div
          className="fixed inset-0 z-[96] grid place-items-end p-4 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold">ETHUB Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={model}
                  onChange={(e) => {
                    modelTouchedRef.current = true;
                    setModel(e.target.value);
                  }}
                  onBlur={() => setModelMenuOpen(false)}
                  className="rounded-md border bg-background px-2 py-1 text-sm"
                >
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="max-h-[50vh] overflow-auto p-4 space-y-3 text-sm">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "text-right"
                      : "text-left"
                  }
                >
                  <div
                    className={[
                      "inline-block rounded-lg px-3 py-2",
                      m.role === "user"
                        ? "bg-foreground/10"
                        : "bg-background border"
                    ].join(" ")}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {!messages.length && (
                <div className="opacity-70">
                  Try asking about services, documents, or say “Tell me a joke.”
                  Select “GPT-4o Voice” to hear replies.
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t p-3">
              {audioStream ? (
                <Button size="icon" variant="secondary" onClick={stopMic} aria-label="Stop mic">
                  <MicOff className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="icon" variant="secondary" onClick={startMic} aria-label="Start mic">
                  <Mic className="h-4 w-4" />
                </Button>
              )}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(false);
                  }
                }}
                placeholder="Type a message…"
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
              />
              <Button onClick={() => send(false)} disabled={busy || !input.trim()}>
                {busy ? "Thinking…" : "Send"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
