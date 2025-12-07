"use client";

import * as React from "react";
import { X, Send } from "lucide-react";

/**
 * Props:
 * - messages: [{role, content}]
 * - busy: boolean
 * - onSend: (text: string) => Promise<void>
 * - audioEl?: HTMLAudioElement | null  // pass the TTS <audio> element here (we’ll analyze it)
 */
export function GlowChatPanel({
  messages,
  busy,
  onSend,
  audioEl,
  placeholder = "Describe the issue…",
}: {
  messages: { role: "user" | "assistant"; content: string }[];
  busy: boolean;
  onSend: (text: string) => Promise<void>;
  audioEl?: HTMLAudioElement | null;
  placeholder?: string;
}) {
  const [input, setInput] = React.useState("");
  const sheetRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const dataRef = React.useRef<Uint8Array | null>(null);

  // VisualViewport-aware centering (prevents keyboard overlap on mobile)
  React.useEffect(() => {
    const el = sheetRef.current;
    if (!el || !window.visualViewport) return;

    const vv = window.visualViewport;
    const update = () => {
      el.style.bottom = `${Math.max(0, (window.innerHeight - vv.height) + (vv.offsetTop || 0))}px`;
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  // Set up WebAudio analyser from the provided TTS audio element.
  React.useEffect(() => {
    if (!audioEl) return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    const src = ctx.createMediaElementSource(audioEl);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    src.connect(analyser);
    analyser.connect(ctx.destination); // so you can hear it

    analyserRef.current = analyser;
    dataRef.current = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      const cvs = canvasRef.current;
      const a = analyserRef.current;
      const data = dataRef.current;
      if (!cvs || !a || !data) return;

      const g = cvs.getContext("2d")!;
      const W = (cvs.width = cvs.clientWidth * devicePixelRatio);
      const H = (cvs.height = cvs.clientHeight * devicePixelRatio);

      a.getByteFrequencyData(data);

      g.clearRect(0, 0, W, H);

      // glassy baseline
      g.globalAlpha = 0.15;
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, W, H);
      g.globalAlpha = 1;

      // draw multi-color layered waves (rainbow)
      const layers = 6;
      for (let L = 0; L < layers; L++) {
        const hue = (L * 360) / layers;
        g.strokeStyle = `hsla(${hue}, 95%, 60%, 0.85)`;
        g.lineWidth = Math.max(1.5, (H / 500) * (1 + L * 0.3));
        g.beginPath();

        const step = Math.max(2, Math.floor(data.length / 64));
        for (let i = 0; i < data.length; i += step) {
          const v = data[i] / 255; // 0..1
          const x = (i / (data.length - 1)) * W;
          // sine-y offset per layer + energy
          const y =
            H * 0.65 +
            Math.sin((i / data.length) * Math.PI * 2 + L * 0.7 + performance.now() / 900) *
              (H * 0.08) +
            -v * (H * (0.12 + L * 0.03));
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { ctx.close(); } catch {}
      audioCtxRef.current = null;
      analyserRef.current = null;
      dataRef.current = null;
    };
  }, [audioEl]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await onSend(text);
  };

  return (
    <div ref={sheetRef} className="ethub-sheet">
      <div className="ethub-panel ethub-glow-border">
        {/* header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 rounded-full overflow-hidden">
              <div className="absolute inset-0"
                   style={{ animation: "ethub-spin 6s linear infinite" }}
              />
              <span className="absolute inset-[2px] rounded-full border border-white/20 bg-black/50" />
            </div>
            <div className="font-semibold text-white/90">ETHUB Assistant</div>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-1 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => {
              // consumer decides close behavior via parent (optional)
              const ev = new CustomEvent("ethub:assistant:close");
              window.dispatchEvent(ev);
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="ethub-rainbow-bar" />

        {/* messages with animated wave underneath */}
        <div className="relative p-3 pb-2 grow min-h-[28vh] max-h-[48vh] overflow-auto">
          <canvas ref={canvasRef} className="ethub-wave" />
          <div className="relative space-y-2">
            {messages?.length ? (
              messages.map((m, i) =>
                m.role === "user" ? (
                  <div
                    key={i}
                    className="ml-auto max-w-[85%] rounded-lg bg-white text-black px-3 py-2 text-sm"
                  >
                    {m.content}
                  </div>
                ) : (
                  <div
                    key={i}
                    className="mr-auto max-w-[85%] rounded-lg bg-black/60 text-white px-3 py-2 text-sm backdrop-blur"
                  >
                    {m.content}
                  </div>
                )
              )
            ) : (
              <div className="text-sm text-white/80">
                Ask me about phone repairs—screen, battery, water damage, boot loops, weird gremlins. I’ll speak your answer and
                draw it in color.
              </div>
            )}
          </div>
        </div>

        {/* composer */}
        <form onSubmit={submit} className="p-3 pt-2 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-full bg-black/60 text-white placeholder:text-white/50 px-4 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            placeholder={placeholder}
          />
          <button
            type="submit"
            className="ethub-send h-12 w-12 bg-black text-white border border-white/10"
            aria-label="Send"
            disabled={busy}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
