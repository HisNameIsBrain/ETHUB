// --- inside VoiceDock component ---

// Close & teardown
const handleClose = useCallback(() => {
  hardReset();
  onClose();
  onExitReset?.();
  const sid = sessionIdRef.current as any;
  if (sid) endSession({ sessionId: sid });
}, [hardReset, onClose, onExitReset, endSession]);

// Start a session when overlay opens
useEffect(() => {
  let cancelled = false;
  if (!open || sessionIdRef.current) return;

  (async () => {
    try {
      const { sessionId } = await startSession({ model });
      if (cancelled) return;
      sessionIdRef.current = sessionId;
      safeLog("session_started", { sessionId });
    } catch (err: any) {
      safeLog("error", { stage: "startSession", message: String(err?.message ?? err) });
    }
  })();

  return () => {
    cancelled = true;
  };
}, [open, model, startSession, safeLog]);

// Init mic + analyser when we can listen
useEffect(() => {
  if (!open) {
    hardReset();
    return;
  }
  if (!canListen) return;

  let stopped = false;
  let raf = 0;

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
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
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

          g.beginPath();
          g.arc(cx, cy, baseR * 1.25, 0, Math.PI * 2);
          g.globalAlpha = 0.12;
          g.fillStyle = "#fff";
          g.fill();
          g.globalAlpha = 1;

          g.beginPath();
          g.arc(cx, cy, r, 0, Math.PI * 2);
          g.globalAlpha = paused ? 0.4 : 0.85;
          g.fillStyle = "#fff";
          g.fill();
          g.globalAlpha = 1;

          g.beginPath();
          g.arc(cx, cy, baseR * 0.4, 0, Math.PI * 2);
          g.fillStyle = "#0ea5e9";
          g.fill();
        }

        raf = requestAnimationFrame(draw);
      };

      raf = requestAnimationFrame(draw);
      safeLog("mic_open", {});
    } catch (err: any) {
      setPermissionError(err?.message || "Microphone permission denied");
      safeLog("error", { stage: "getUserMedia", message: String(err?.message ?? err) });
    }
  })();

  return () => {
    stopped = true;
    if (raf) cancelAnimationFrame(raf);
    analyserRef.current = undefined;
    sourceRef.current = undefined;
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
  };
}, [open, canListen, rmsThreshold, silenceMs, paused, hardReset, safeLog]);

if (!open) return null;

return (
  <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-label="Voice AI overlay">
    {/* scrim */}
    <div className="absolute inset-0 bg-black/60" />

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
        className="relative inline-flex size-44 items-center justify-center rounded-full bg-white/10 p-2 backdrop-blur-md ring-1 ring-white/30 hover:ring-white/40"
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

    {/* Live captions slot (future)
    <div className="absolute bottom-44 left-1/2 -translate-x-1/2 w-[min(680px,92vw)] text-center text-white/90 text-sm">
      {partialCaption}
    </div>
    */}
  </div>
);
