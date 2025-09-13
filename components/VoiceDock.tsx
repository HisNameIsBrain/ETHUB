"use client";

import React, { useCallback, useEffect, useRef, useState } from "react"; import { Mic, MicOff, X, Pause, Play } from "lucide-react"; import { useMutation } from "convex/react"; import { api } from "@/convex/_generated/api"; import { useUser } from "@clerk/nextjs"; import { voiceBus } from "@/lib/voiceBus";

/**

VoiceDock.tsx — regenerated

Isolated voice overlay with:

• Bottom-center visualizer bubble (click to pause/resume)

• Bottom-left mic toggle (mute/unmute)

• Top-right close (X) with full teardown + parent reset

• Auto-pause on silence, keyboard controls (Esc/Space/M)

• Auto-mute while client TTS plays (via voiceBus tts:start/tts:end)

• Convex analytics hooks (startSession/logEvent/endSession)

• Ready slot for live captions (later)

Props

open: boolean


model?: string


onClose: () => void


onExitReset?: () => void


silenceMs?: number (default 2000)


rmsThreshold?: number (default 0.02) */



export type VoiceDockProps = { open: boolean; model?: string; onClose: () => void; onExitReset?: () => void; silenceMs?: number; rmsThreshold?: number; };

export default function VoiceDock({ open, model, onClose, onExitReset, silenceMs = 2000, rmsThreshold = 0.02, }: VoiceDockProps) { const { user } = useUser();

// Convex mutations for analytics const startSession = useMutation(api.voice.startSession); const logEvent = useMutation(api.voice.logEvent); const endSession = useMutation(api.voice.endSession);

// UI state const [muted, setMuted] = useState(false); const [paused, setPaused] = useState(false); const [permissionError, setPermissionError] = useState<string | null>(null);

// Media graph const mediaStreamRef = useRef<MediaStream | null>(null); const audioCtxRef = useRef<AudioContext | null>(null); const analyserRef = useRef<AnalyserNode | null>(null); const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null); const rafRef = useRef<number | null>(null); const lastVoiceTsRef = useRef<number>(Date.now()); const canvasRef = useRef<HTMLCanvasElement | null>(null);

// Session + helpers const sessionIdRef = useRef<string | null>(null); const autoMutedRef = useRef(false); // we toggled mute due to TTS const prevPausedRef = useRef(false); // for pausing during TTS

const canListen = open && !muted && !paused && !permissionError;

// ---- analytics helpers const safeLog = useCallback(async (type: string, payload?: any) => { const sid = sessionIdRef.current as any; if (!sid) return; try { await logEvent({ sessionId: sid, type, payload }); } catch {} }, [logEvent]);

const hardReset = useCallback(() => { // teardown media if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; try { analyserRef.current?.disconnect(); } catch {} analyserRef.current = null; try { sourceRef.current?.disconnect(); } catch {} sourceRef.current = null; if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; } mediaStreamRef.current?.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null;

setMuted(false);
setPaused(false);
setPermissionError(null);

}, []);

const handleClose = useCallback(() => { hardReset(); onClose(); onExitReset?.(); const sid = sessionIdRef.current as any; if (sid) endSession({ sessionId: sid, reason: "user_closed" }).catch(() => {}); sessionIdRef.current = null; }, [hardReset, onClose, onExitReset, endSession]);

// Start a session when overlay opens useEffect(() => { let cancelled = false; (async () => { if (!open) return; if (sessionIdRef.current) return; // already started try { const res = await startSession({ model, ua: typeof navigator !== "undefined" ? navigator.userAgent : undefined, path: typeof window !== "undefined" ? window.location.pathname : undefined, userId: user?.id, }); if (!cancelled) sessionIdRef.current = (res as any).sessionId; } catch {} })(); return () => { cancelled = true; }; }, [open, model, startSession, user?.id]);

// Init mic + analyser when we can listen useEffect(() => { if (!open) { hardReset(); return; } if (!canListen) return;

let stopped = false;
(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (stopped) return;
    mediaStreamRef.current = stream;
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    sourceRef.current = src;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyserRef.current = analyser;
    src.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    const cvs = canvasRef.current;
    const g = cvs?.getContext("2d") ?? null;
    const W = cvs?.width ?? 160;
    const H = cvs?.height ?? 160;

    const draw = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
      const rms = Math.sqrt(sum / data.length);
      const now = Date.now();
      if (rms > rmsThreshold) lastVoiceTsRef.current = now;
      if (!paused && now - lastVoiceTsRef.current > silenceMs) {
        setPaused(true);
        safeLog("pause", { reason: "silence" });
      }
      if (g && cvs) {
        g.clearRect(0, 0, W, H);
        const cx = W / 2, cy = H / 2;
        const baseR = Math.min(W, H) * 0.32;
        const r = baseR + Math.min(baseR * 0.8, rms * 90);
        g.beginPath(); g.arc(cx, cy, baseR * 1.25, 0, Math.PI * 2); g.globalAlpha = 0.12; g.fillStyle = "#fff"; g.fill(); g.globalAlpha = 1;
        g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.globalAlpha = paused ? 0.4 : 0.85; g.fillStyle = "#fff"; g.fill(); g.globalAlpha = 1;
        g.beginPath(); g.arc(cx, cy, baseR * 0.4, 0, Math.PI * 2); g.fillStyle = "#0ea5e9"; g.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    safeLog("mic_open", {});
  } catch (err: any) {
    setPermissionError(err?.message || "Microphone permission denied");
    safeLog("error", { stage: "getUserMedia", message: String(err?.message ?? err) });
  }
})();
return () => { stopped = true; if (rafRef.current) cancelAnimationFrame(rafRef.current); };

}, [open, canListen, rmsThreshold, silenceMs, paused, hardReset, safeLog]);

// Pause/Resume toggle const togglePause = useCallback(() => { setPaused((p) => { const next = !p; safeLog(next ? "pause" : "resume"); lastVoiceTsRef.current = Date.now(); return next; }); }, [safeLog]);

// Mute toggle const toggleMute = useCallback(() => { setMuted((m) => { const next = !m; safeLog(next ? "mute" : "unmute"); return next; }); }, [safeLog]);

// Keyboard shortcuts useEffect(() => { if (!open) return; const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); handleClose(); } else if (e.key.toLowerCase() === "m") { e.preventDefault(); toggleMute(); } else if (e.code === "Space") { e.preventDefault(); togglePause(); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [open, handleClose, toggleMute, togglePause]);

// Enable/disable tracks when muted changes useEffect(() => { if (!open) return; const stream = mediaStreamRef.current; stream?.getTracks().forEach((t) => (t.enabled = !muted)); }, [muted, open]);

// Auto-mute + pause visualizer during client TTS useEffect(() => { if (!open) return; const offStart = voiceBus.on("tts:start", () => { if (!muted) { autoMutedRef.current = true; setMuted(true); } prevPausedRef.current = paused; if (!paused) setPaused(true); }); const offEnd = voiceBus.on("tts:end", () => { if (autoMutedRef.current) { autoMutedRef.current = false; setMuted(false); } if (!prevPausedRef.current) setPaused(false); }); return () => { offStart(); offEnd(); }; }, [open, muted, paused]);

if (!open) return null;

return ( <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-label="Voice AI overlay"> {/* scrim */} <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

{/* Close */}
  <button
    onClick={handleClose}
    aria-label="Exit voice session"
    className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow hover:bg-white"
  >
    <X className="h-5 w-5" />
  </button>

  {/* Model badge */}
  {model && (
    <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-900 shadow">
      {model}
    </div>
  )}

  {/* Mic toggle */}
  <button
    onClick={toggleMute}
    aria-label={muted ? "Unmute microphone" : "Mute microphone"}
    className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-gray-900 shadow hover:bg-white"
  >
    {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    <span className="text-sm font-medium">{muted ? "Silenced" : "Live"}</span>
  </button>

  {/* Visualizer bubble */}
  <div className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2">
    <button
      onClick={togglePause}
      aria-label={paused ? "Resume voice" : "Pause voice"}
      className="relative inline-flex size-44 items-center justify-center rounded-full bg-white/10 p-2 backdrop-blur-md ring-1 ring-white/30 hover:ring-white/50"
    >
      <canvas ref={canvasRef} width={160} height={160} className="absolute inset-0 m-auto size-40 rounded-full" />
      <div className="relative z-10 flex size-10 items-center justify-center rounded-full bg-black/40 text-white">
        {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
      </div>
    </button>
    <div className="mt-2 text-center text-xs text-white/80">
      {permissionError ? permissionError : paused ? "Paused – click to resume" : muted ? "Mic muted" : "Listening… click to pause"}
    </div>
  </div>

  {/* Live captions slot (future):
  <div className="absolute bottom-44 left-1/2 -translate-x-1/2 w-[min(680px,92vw)] text-center text-white/90 text-sm">
    {partialCaption}
  </div>
  */}
</div>

); }


