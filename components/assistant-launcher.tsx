"use client";

import * as React from "react";
import ReactDOM from "react-dom";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiriGlowInvert } from "@/components/siri-glow-invert";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { speakWithOpenAI } from "@/lib/tts";
import { GlowChatPanel } from "@/components/assistant/GlowChatPanel";

export default function Assistant() {
  const [messages, setMessages] = React.useState<{role:"user"|"assistant";content:string}[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [audioEl, setAudioEl] = React.useState<HTMLAudioElement | null>(null);

  const chat = useAction(api.openai.chat);

  async function onSend(text: string) {
    setBusy(true);
    try {
      setMessages((m) => [...m, { role: "user", content: text }]);
      const res = await chat({ messages: [...messages, { role: "user", content: text }] });
      const answer = typeof res?.content === "string" ? res.content : (res?.text ?? "");
      setMessages((m) => [...m, { role: "assistant", content: answer }]);

      // Play TTS and keep the <audio> for the visualizer
      const audio = await speakWithOpenAI(answer, "alloy", "mp3", { returnAudioEl: true });
      setAudioEl(audio); // wave panel will analyze this audio element
    } finally {
      setBusy(false);
    }
  }

  React.useEffect(() => {
    const onClose = () => {/* mount/unmount your overlay here if you have one */};
    window.addEventListener("ethub:assistant:close", onClose);
    return () => window.removeEventListener("ethub:assistant:close", onClose);
  }, []);

  return (
    <GlowChatPanel
      messages={messages}
      busy={busy}
      onSend={onSend}
      audioEl={audioEl}
    />
  );
}

type Role = "system" | "user" | "assistant";

// Fixed, non-editable system prompt focused on mobile repair.
const SYSTEM_PROMPT: { role: Role; content: string } = {
  role: "system",
  content: `You are a specialized AI assistant focused on mobile phone repair and troubleshooting.
- Provide step-by-step repair instructions (hardware + software).
- Offer safety notes where relevant (battery, ESD, adhesives, fragile flex cables).
- Keep language clear; avoid unexplained jargon.
- Suggest escalation to a pro when a fix is risky or requires specialized tools.
- Mention warranty implications when appropriate.`
};

// Hard-coded chat model (not exposed in UI). We always TTS the assistant’s reply.
const CHAT_MODEL = "gpt-4o-mini" as const;
// Hard-coded TTS voice + format (your /api/tts uses these).
const TTS_VOICE = "alloy" as const;
const TTS_FORMAT = "mp3" as const;

/* ------------------------- tiny Siri-like wave ------------------------- */
/** Lightweight canvas wave (no deps). Sits behind the composer & header */
function SiriWave({
  height = 48,
  amplitude = 9,
  speed = 0.015,
  className,
}: {
  height?: number;
  amplitude?: number;
  speed?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  const raf = React.useRef<number>();
  const t = React.useRef(0);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let mounted = true;
    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = canvas.clientWidth | 0;
      const h = height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      (ctx as any).scale?.(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      if (!mounted || !canvas) return;
      const w = canvas.clientWidth | 0;
      const h = height;
      ctx.clearRect(0, 0, w, h);

      // multi-lobe wave with Siri-ish palette
      const bands = [
        "rgba(255,242,0,0.85)",
        "rgba(255,138,0,0.85)",
        "rgba(255,0,122,0.85)",
        "rgba(122,0,255,0.85)",
        "rgba(0,72,255,0.85)",
        "rgba(0,162,255,0.85)",
        "rgba(0,255,162,0.85)",
        "rgba(160,255,0,0.85)",
      ];

      let yMid = h / 2;
      for (let i = 0; i < bands.length; i++) {
        const phase = t.current + i * 0.7;
        const amp = amplitude * (1 - i / bands.length) * 0.9;
        ctx.beginPath();
        for (let x = 0; x <= w; x++) {
          const y = yMid + Math.sin(x * 0.02 + phase) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = bands[i];
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 0.9;
        ctx.stroke();
      }

      t.current += speed;
      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);
    return () => {
      mounted = false;
      ro.disconnect();
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [height, amplitude, speed]);

  return (
    <div className={className} style={{ pointerEvents: "none" }}>
      <canvas ref={ref} style={{ width: "100%", height }} />
    </div>
  );
}

/* --------------------------- AI bubble with glow --------------------------- */
function AIBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mr-auto max-w-[85%]">
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
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] mix-blend-overlay" />
      </div>

      <div className="rounded-2xl bg-black/55 text-white px-3 py-2 text-sm backdrop-blur">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------- Launcher btn ------------------------------ */
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
      {/* Minimal robo-dot center */}
      <div className="relative z-[1] h-3 w-3 rounded-full bg-white/90" />
    </button>
  );
}

/* -------------------------------- Component -------------------------------- */
export default function AssistantLauncher() {
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  // No model picker; we always use CHAT_MODEL + TTS on replies
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ role: Role; content: string }>>([]);

  const chatAction = useAction(api.openai.chat);
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

  function getTextFromResponse(res: any): string {
    if (!res) return "";
    if (typeof res.content === "string") return res.content;
    if (typeof res.text === "string") return res.text;
    return "";
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setBusy(true);
    try {
      // moderation gate
      const mod = await moderateAction({ text });
      if (mod?.flagged) {
        setMessages((m) => [...m, { role: "assistant", content: "Sorry, I can’t help with that." }]);
        return;
      }

      const next = [...messages.length ? messages : [SYSTEM_PROMPT], { role: "user", content: text }];
      setMessages(next);

      const res = await chatAction({ model: CHAT_MODEL, messages: next as any });
      const output = getTextFromResponse(res);

      if (output) {
        setMessages((m) => [...m, { role: "assistant", content: output }]);
        // Always TTS the reply (no mic ever, we only speak responses)
        await speakWithOpenAI(output, { voice: TTS_VOICE, format: TTS_FORMAT });
      }
    } catch (err) {
      console.error("Assistant error:", err);
      setMessages((m) => [...m, { role: "assistant", content: "Something went sideways. Try again." }]);
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
            {/* Header */}
            <div className="relative">
              <div className="absolute inset-x-3 top-0">
                <SiriWave height={36} amplitude={8} speed={0.02} />
              </div>
              <div className="relative flex items-center justify-between p-3 pb-2 border-b">
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
                <Button size="icon" variant="ghost" onClick={() => setOpen(false)} title="Close">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="max-h-[40vh] overflow-auto p-3 space-y-3">
              {messages.filter(m => m.role !== "system").length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ask me about phone repairs—screen, battery, water damage, boot loops, mystery gremlins…
                  I’ll speak the answer back to you.
                </p>
              )}
              {messages
                .filter(m => m.role !== "system")
                .map((m, i) =>
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
            <div className="relative border-t">
              <div className="absolute inset-x-3 -top-[2px]">
                <SiriWave height={34} amplitude={7} speed={0.021} />
              </div>

              <form
                className="relative z-[1] flex items-center gap-2 p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 rounded-md border px-3 py-2 text-sm bg-background"
                  placeholder="Describe the issue…"
                />

                {/* Single animated icon button (no label) */}
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className={`relative h-10 w-10 grid place-items-center rounded-full transition
                      ${busy ? "opacity-70" : "hover:scale-105 active:scale-95"}
                    `}
                >
                  {/* Glow ring */}
                  <span className="absolute inset-0 rounded-full overflow-hidden">
                    <SiriGlowInvert
                      rotateSec={2.8}
                      innerRotateSec={3.6}
                      blurPx={12}
                      insetPercent={-8}
                      opacity={0.9}
                      thicknessPx={9}
                      inner
                    />
                  </span>
                  <span className="absolute inset-[2px] rounded-full bg-neutral-950/95 border border-white/10" />
                  <Send
                    className={`relative z-[1] h-5 w-5 text-white transition-transform
                      ${busy ? "animate-pulse" : ""}`}
                  />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
