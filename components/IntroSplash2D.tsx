"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * IntroSplash2D — Cleaner logo + more visible motherboard + lively rainbow rotating outline
 * - Fewer components (cleaner, more readable board)
 * - Stronger board contrast + sharper thermal layer (less blur)
 * - Rainbow outline rotates + pulses (lively)
 * - Logo rendered clearer (crisper SVG + outline ring doesn't muddy it)
 *
 * Requires:
 * - /public/logo.svg
 *
 * Audio:
 * - Put a file at /public/sfx/intro.mp3 (or pass audioSrc)
 * - Autoplay may be blocked until user gesture; this attempts on pointer/key + visibility.
 */

export default function IntroSplash2D({
  chargeMs = 1400,
  holdMs = 1600,
  dischargeMs = 1200,
  fadeMs = 700,

  audioEnabled = true,
  audioSrc = "/sfx/intro.mp3",
  audioVolume = 0.35,
  audioStartMs = 40,
  audioFadeOutMs = 420,
}: {
  chargeMs?: number;
  holdMs?: number;
  dischargeMs?: number;
  fadeMs?: number;

  audioEnabled?: boolean;
  audioSrc?: string;
  audioVolume?: number;
  audioStartMs?: number;
  audioFadeOutMs?: number;
}) {
  const [mounted, setMounted] = React.useState(true);

  const baseRef = React.useRef<HTMLCanvasElement | null>(null);
  const thermalRef = React.useRef<HTMLCanvasElement | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const audioStartedRef = React.useRef(false);
  const fadeRafRef = React.useRef<number | null>(null);

  const totalMs = chargeMs + holdMs + dischargeMs + fadeMs;

  React.useEffect(() => {
    const t = window.setTimeout(() => setMounted(false), totalMs);
    return () => window.clearTimeout(t);
  }, [totalMs]);

  const sceneRef = React.useRef<Scene | null>(null);

  // Build a simpler, cleaner board scene once (less clutter, more readable)
  React.useEffect(() => {
    const rand = mulberry32(9091);

    const chips: Chip[] = [];
    const traces: Trace[] = [];
    const vias: Via[] = [];
    const caps: Cap[] = [];
    const inductors: Inductor[] = [];
    const headers: Header[] = [];
    const sockets: Socket[] = [];
    const silks: Silk[] = [];

    // major ICs (reduced)
    for (let i = 0; i < 9; i++) {
      const w = lerp(160, 290, rand());
      const h = lerp(100, 190, rand());
      const x = lerp(-520, 520, rand());
      const y = lerp(-300, 300, rand());
      chips.push({
        x,
        y,
        w,
        h,
        heatSeed: rand(),
        onAt: lerp(0.18, 1.0, rand()),
        offAt: lerp(2.8, 4.2, rand()),
        kind: "ic",
      });
    }

    // smaller ICs (reduced)
    for (let i = 0; i < 14; i++) {
      const w = lerp(70, 140, rand());
      const h = lerp(34, 86, rand());
      const x = lerp(-660, 660, rand());
      const y = lerp(-380, 380, rand());
      chips.push({
        x,
        y,
        w,
        h,
        heatSeed: rand(),
        onAt: lerp(0.22, 1.2, rand()),
        offAt: lerp(3.0, 4.8, rand()),
        kind: "icSmall",
      });
    }

    // capacitors (reduced)
    for (let i = 0; i < 42; i++) {
      caps.push({
        x: lerp(-780, 780, rand()),
        y: lerp(-460, 460, rand()),
        r: lerp(10, 17, rand()),
        h: lerp(20, 34, rand()),
        seed: rand(),
      });
    }

    // inductors (reduced)
    for (let i = 0; i < 10; i++) {
      inductors.push({
        x: lerp(-720, 720, rand()),
        y: lerp(-420, 420, rand()),
        w: lerp(54, 86, rand()),
        h: lerp(38, 64, rand()),
        seed: rand(),
      });
    }

    // headers/connectors (reduced)
    for (let i = 0; i < 10; i++) {
      headers.push({
        x: lerp(-820, 820, rand()),
        y: lerp(-500, 500, rand()),
        w: lerp(120, 240, rand()),
        h: lerp(26, 48, rand()),
        seed: rand(),
      });
    }

    // sockets (keep a few large readable rails)
    for (let i = 0; i < 4; i++) {
      sockets.push({
        x: lerp(-720, 720, rand()),
        y: lerp(-420, 420, rand()),
        w: lerp(300, 440, rand()),
        h: lerp(46, 72, rand()),
        seed: rand(),
      });
    }

    // vias (reduced)
    for (let i = 0; i < 190; i++) {
      vias.push({
        x: lerp(-900, 900, rand()),
        y: lerp(-520, 520, rand()),
        r: lerp(1.3, 3.0, rand()),
        seed: rand(),
      });
    }

    // traces (reduced; slightly thicker)
    for (let i = 0; i < 140; i++) {
      const x1 = lerp(-900, 900, rand());
      const y1 = lerp(-520, 520, rand());
      const dir = rand();
      const x2 = dir < 0.5 ? x1 + lerp(-420, 420, rand()) : x1 + lerp(-90, 90, rand());
      const y2 = dir < 0.5 ? y1 + lerp(-90, 90, rand()) : y1 + lerp(-320, 320, rand());
      const width = lerp(1.3, 4.4, rand());
      traces.push({ x1, y1, x2, y2, width, seed: rand() });
    }

    // fewer labels
    const labelPool = ["U12", "VRM", "PCIE", "CPU_PWR", "BIOS", "M2_1", "LAN", "USB"];
    for (let i = 0; i < 20; i++) {
      silks.push({
        x: lerp(-840, 840, rand()),
        y: lerp(-500, 500, rand()),
        text: labelPool[Math.floor(rand() * labelPool.length)],
        seed: rand(),
      });
    }

    sceneRef.current = { chips, traces, vias, caps, inductors, headers, sockets, silks };
  }, []);

  // Audio (gesture-safe start + fade out near the end)
  React.useEffect(() => {
    if (!mounted) return;
    if (!audioEnabled) return;

    const el = audioRef.current;
    if (!el) return;

    el.src = audioSrc;
    el.preload = "auto";
    el.playsInline = true;
    el.volume = clamp01(audioVolume);

    const cleanupFade = () => {
      if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    };

    const stopReset = () => {
      cleanupFade();
      try {
        el.pause();
        el.currentTime = 0;
      } catch {}
      el.volume = clamp01(audioVolume);
      audioStartedRef.current = false;
    };

    const startWithFadePlan = async () => {
      if (audioStartedRef.current) return;
      audioStartedRef.current = true;

      try {
        el.currentTime = 0;
        el.volume = clamp01(audioVolume);
        await el.play();
      } catch {
        audioStartedRef.current = false;
        return;
      }

      const fadeStartAt = Math.max(0, totalMs - audioFadeOutMs);
      const startMs = performance.now();

      const tick = () => {
        const elapsed = performance.now() - startMs;

        if (elapsed >= fadeStartAt) {
          const k = clamp01((elapsed - fadeStartAt) / Math.max(1, audioFadeOutMs));
          el.volume = clamp01(audioVolume) * (1 - k);
        }

        if (elapsed >= totalMs) {
          stopReset();
          return;
        }

        fadeRafRef.current = requestAnimationFrame(tick);
      };

      fadeRafRef.current = requestAnimationFrame(tick);
    };

    const tryStart = () => {
      if (audioStartedRef.current) return;
      window.setTimeout(() => void startWithFadePlan(), Math.max(0, audioStartMs));
    };

    const onFirstGesture = () => tryStart();
    const onVis = () => {
      if (document.visibilityState === "visible") tryStart();
    };

    // try immediately (may fail), then retry on user gesture.
    tryStart();
    window.addEventListener("pointerdown", onFirstGesture, { once: true, passive: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      cleanupFade();
      stopReset();
    };
  }, [mounted, audioEnabled, audioSrc, audioVolume, audioStartMs, audioFadeOutMs, totalMs]);

  React.useEffect(() => {
    const base = baseRef.current;
    const thermal = thermalRef.current;
    const root = rootRef.current;
    const scene = sceneRef.current;
    if (!base || !thermal || !scene || !root) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const baseCtx = base.getContext("2d", { alpha: true })!;
    const thCtx = thermal.getContext("2d", { alpha: true })!;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      base.width = Math.floor(window.innerWidth * dpr);
      base.height = Math.floor(window.innerHeight * dpr);
      thermal.width = base.width;
      thermal.height = base.height;

      base.style.width = `${window.innerWidth}px`;
      base.style.height = `${window.innerHeight}px`;
      thermal.style.width = `${window.innerWidth}px`;
      thermal.style.height = `${window.innerHeight}px`;
    };

    resize();
    window.addEventListener("resize", resize);

    const t0 = performance.now();
    let raf = 0;

    const draw = () => {
      const now = performance.now();
      const t = (now - t0) / 1000;
      const ms = t * 1000;

      const chargeT = clamp01(ms / chargeMs);
      const dischargeT = clamp01((ms - chargeMs - holdMs) / dischargeMs);
      const fadeT = clamp01((ms - chargeMs - holdMs - dischargeMs) / fadeMs);

      const inCharge = ms < chargeMs;
      const inHold = ms >= chargeMs && ms < chargeMs + holdMs;
      const inDischarge = ms >= chargeMs + holdMs && ms < chargeMs + holdMs + dischargeMs;

      const voltage = inCharge ? easeOutCubic(chargeT) : inHold ? 1 : inDischarge ? 1 - easeOutCubic(dischargeT) : 0;

      const spin = reduce ? 0 : (t * 70) % 360;
      const outlineSpin = reduce ? 0 : (t * 110) % 360;

      const driftX = reduce ? 0 : Math.sin(t * 0.9) * 10 + Math.sin(t * 2.2) * 5;
      const driftY = reduce ? 0 : Math.cos(t * 0.8) * 8 + Math.sin(t * 1.7) * 5;

      const sceneOpacity = 1 - easeOutCubic(fadeT);
      const outlinePulse = reduce ? 0 : 0.5 + 0.5 * Math.sin(t * 3.2);

      root.style.setProperty("--spin", `${spin}deg`);
      root.style.setProperty("--outlineSpin", `${outlineSpin}deg`);
      root.style.setProperty("--voltage", `${voltage}`);
      root.style.setProperty("--sceneOpacity", `${sceneOpacity}`);
      root.style.setProperty("--dx", `${driftX}px`);
      root.style.setProperty("--dy", `${driftY}px`);
      root.style.setProperty("--pulse", `${outlinePulse}`);

      renderBoardTopDown(baseCtx, base.width, base.height, scene, t, voltage);

      thCtx.clearRect(0, 0, thermal.width, thermal.height);
      thCtx.drawImage(base, 0, 0);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [chargeMs, holdMs, dischargeMs, fadeMs]);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={rootRef}
        key="intro-mobo-cleaner"
        className="intro-root fixed inset-0 z-[9999] overflow-hidden bg-black"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: Math.min(0.7, fadeMs / 1000), ease: "easeOut" }}
        aria-label="Loading ETHUB"
      >
        <audio ref={audioRef} preload="auto" playsInline />

        <canvas className="absolute inset-0 boardBase" ref={baseRef} />
        <canvas className="absolute inset-0 boardThermal" ref={thermalRef} />

        <div className="pointer-events-none absolute inset-0 scanWrap">
          <div className="scanline" />
        </div>

        <div className="pointer-events-none absolute inset-0 vignette" />

        <div className="relative z-10 grid h-full w-full place-items-center px-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="logoOutline" aria-hidden />
              <div className="logoRim" aria-hidden />
              <div className="logoStars" aria-hidden />
              <img src="/logo.svg" alt="ETHUB logo" className="logoImg" />
            </div>

            <div className="mt-6 select-none text-center">
              <div className="ethubText">ETHUB</div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .intro-root {
            --spin: 0deg;
            --outlineSpin: 0deg;
            --voltage: 0;
            --sceneOpacity: 1;
            --dx: 0px;
            --dy: 0px;
            --pulse: 0.5;
          }

          .boardBase,
          .boardThermal {
            opacity: var(--sceneOpacity);
            transform: translate3d(var(--dx), var(--dy), 0);
            will-change: transform, opacity, filter;
          }

          .boardBase {
            filter: contrast(1.32) saturate(1.22) brightness(1.14) drop-shadow(0 24px 90px rgba(0, 0, 0, 0.55));
          }

          .boardThermal {
            mix-blend-mode: screen;
            filter: invert(1) hue-rotate(var(--spin)) saturate(1.55) contrast(1.22) brightness(1.1) blur(0.35px);
            opacity: calc((0.50 + 0.18 * var(--voltage)) * var(--sceneOpacity));
          }

          .vignette {
            background: radial-gradient(
              circle at 50% 45%,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 0, 0, 0.26) 55%,
              rgba(0, 0, 0, 0.82) 100%
            );
          }

          .scanWrap {
            opacity: calc(0.85 * var(--sceneOpacity));
          }
          .scanline {
            position: absolute;
            left: -18%;
            right: -18%;
            top: -40%;
            height: 18%;
            transform: rotate(-23deg);
            background: linear-gradient(
              180deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 220, 150, 0.10) 25%,
              rgba(255, 130, 40, 0.18) 52%,
              rgba(0, 180, 255, 0.12) 72%,
              rgba(255, 255, 255, 0) 100%
            );
            filter: blur(10px) saturate(1.25);
            mix-blend-mode: screen;
            animation: scanDown 2.1s linear infinite;
          }
          @keyframes scanDown {
            0% {
              transform: rotate(-23deg) translateY(-60%);
            }
            100% {
              transform: rotate(-23deg) translateY(165%);
            }
          }

          .logoImg {
            width: min(540px, 82vw);
            height: auto;
            display: block;
            position: relative;
            z-index: 5;
            opacity: var(--sceneOpacity);
            transform: translateZ(0);
            filter: drop-shadow(0 18px 44px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 1px rgba(255, 255, 255, 0.30));
          }

          .logoRim {
            position: absolute;
            inset: -3%;
            z-index: 4;

            -webkit-mask-image: url("/logo.svg");
            mask-image: url("/logo.svg");
            -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
            -webkit-mask-position: center;
            mask-position: center;
            -webkit-mask-size: contain;
            mask-size: contain;

            background: rgba(255, 255, 255, 0.92);
            filter: blur(1.2px);
            opacity: calc(0.42 * var(--sceneOpacity));
            mix-blend-mode: screen;
          }

          .logoOutline {
            position: absolute;
            inset: -16%;
            z-index: 2;

            -webkit-mask-image: url("/logo.svg");
            mask-image: url("/logo.svg");
            -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
            -webkit-mask-position: center;
            mask-position: center;
            -webkit-mask-size: contain;
            mask-size: contain;

            background: conic-gradient(
              from var(--outlineSpin) at 50% 50%,
              rgba(0, 231, 255, 0.95),
              rgba(168, 85, 247, 0.92),
              rgba(244, 114, 182, 0.92),
              rgba(245, 158, 11, 0.88),
              rgba(0, 231, 255, 0.95)
            );

            filter: blur(20px) saturate(1.9);
            opacity: calc((0.78 + 0.16 * var(--pulse) + 0.10 * var(--voltage)) * var(--sceneOpacity));
            mix-blend-mode: screen;
          }

          .logoStars {
            position: absolute;
            inset: -18%;
            z-index: 3;

            -webkit-mask-image: url("/logo.svg");
            mask-image: url("/logo.svg");
            -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
            -webkit-mask-position: center;
            mask-position: center;
            -webkit-mask-size: contain;
            mask-size: contain;

            background: radial-gradient(circle at 18% 30%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 26%),
              radial-gradient(circle at 82% 28%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 24%),
              radial-gradient(circle at 72% 78%, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0) 26%),
              radial-gradient(circle at 30% 76%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 26%);

            filter: blur(9px);
            opacity: calc((0.55 + 0.35 * var(--pulse)) * var(--sceneOpacity));
            mix-blend-mode: screen;
            animation: starSweep 1.35s ease-in-out infinite;
          }

          @keyframes starSweep {
            0% {
              transform: translate3d(-14px, 8px, 0) scale(0.98);
            }
            50% {
              transform: translate3d(14px, -8px, 0) scale(1.05);
            }
            100% {
              transform: translate3d(-14px, 8px, 0) scale(0.98);
            }
          }

          .ethubText {
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
            font-weight: 800;
            letter-spacing: 0.45em;
            font-size: clamp(28px, 4.6vw, 44px);
            color: rgba(255, 255, 255, 0.96);
            opacity: var(--sceneOpacity);
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.26), 0 0 20px rgba(0, 231, 255, 0.16), 0 0 26px rgba(11, 75, 255, 0.18);
          }

          @media (prefers-reduced-motion: reduce) {
            .logoStars {
              animation: none !important;
            }
            .scanline {
              animation: none !important;
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}

/* -----------------------
   Types
------------------------ */

type Chip = {
  x: number;
  y: number;
  w: number;
  h: number;
  heatSeed: number;
  onAt: number;
  offAt: number;
  kind: "ic" | "icSmall";
};
type Trace = { x1: number; y1: number; x2: number; y2: number; width: number; seed: number };
type Via = { x: number; y: number; r: number; seed: number };
type Cap = { x: number; y: number; r: number; h: number; seed: number };
type Inductor = { x: number; y: number; w: number; h: number; seed: number };
type Header = { x: number; y: number; w: number; h: number; seed: number };
type Socket = { x: number; y: number; w: number; h: number; seed: number };
type Silk = { x: number; y: number; text: string; seed: number };

type Scene = {
  chips: Chip[];
  traces: Trace[];
  vias: Via[];
  caps: Cap[];
  inductors: Inductor[];
  headers: Header[];
  sockets: Socket[];
  silks: Silk[];
};

/* -----------------------
   Renderer — simplified, readable motherboard
------------------------ */

function renderBoardTopDown(ctx: CanvasRenderingContext2D, W: number, H: number, scene: Scene, t: number, voltage: number) {
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "#04060b";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.4);
  ctx.scale(1.14, 1.14);

  const boardGrad = ctx.createLinearGradient(-900, -520, 900, 520);
  boardGrad.addColorStop(0, "#0b1622");
  boardGrad.addColorStop(0.45, "#0c1b2a");
  boardGrad.addColorStop(1, "#08121d");

  ctx.fillStyle = boardGrad;
  roundRect(ctx, -980, -560, 1960, 1120, 44);
  ctx.fill();

  // bevel
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = "rgba(190, 250, 255, 0.18)";
  ctx.lineWidth = 2;
  roundRect(ctx, -980, -560, 1960, 1120, 44);
  ctx.stroke();
  ctx.restore();

  // AO depth
  ctx.save();
  const ao = ctx.createRadialGradient(0, 0, 320, 0, 0, 1220);
  ao.addColorStop(0, "rgba(0,0,0,0.00)");
  ao.addColorStop(1, "rgba(0,0,0,0.58)");
  ctx.fillStyle = ao;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(-1200, -800, 2400, 1600);
  ctx.restore();

  drawTraces(ctx, scene.traces, t, voltage);
  for (const s of scene.sockets) drawSocket(ctx, s);
  for (const h of scene.headers) drawHeader(ctx, h);
  for (const ind of scene.inductors) drawInductor(ctx, ind, t, voltage);
  for (const c of scene.caps) drawCap(ctx, c, t, voltage);
  for (const c of scene.chips) drawChip(ctx, c, t, voltage);
  drawVias(ctx, scene.vias, t, voltage);
  drawSilk(ctx, scene.silks);

  drawVoltageSweep(ctx, t, voltage);

  ctx.restore();
}

/* -----------------------
   Drawing primitives
------------------------ */

function drawTraces(ctx: CanvasRenderingContext2D, traces: Trace[], t: number, voltage: number) {
  ctx.save();

  for (const tr of traces) {
    const pulse = 0.45 + 0.55 * Math.sin(t * 1.65 + tr.seed * 7.0);
    ctx.lineWidth = tr.width;
    ctx.strokeStyle = `rgba(110, 200, 255, ${0.07 + 0.10 * pulse})`;
    ctx.beginPath();
    ctx.moveTo(tr.x1, tr.y1);
    ctx.lineTo(tr.x2, tr.y2);
    ctx.stroke();
  }

  // energized glow
  if (voltage > 0.01) {
    ctx.globalCompositeOperation = "screen";
    for (const tr of traces) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.0 + tr.seed * 8.0);
      const a = (0.03 + 0.16 * voltage) * pulse;
      ctx.strokeStyle = `rgba(255, 150, 60, ${a})`;
      ctx.lineWidth = tr.width + 2.0;
      ctx.beginPath();
      ctx.moveTo(tr.x1, tr.y1);
      ctx.lineTo(tr.x2, tr.y2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawSocket(ctx: CanvasRenderingContext2D, s: Socket) {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.36)";
  roundRect(ctx, s.x + 8, s.y + 10, s.w, s.h, 12);
  ctx.fill();

  const g = ctx.createLinearGradient(s.x, s.y, s.x + s.w, s.y + s.h);
  g.addColorStop(0, "rgba(34, 44, 62, 0.96)");
  g.addColorStop(1, "rgba(16, 22, 34, 0.96)");
  ctx.fillStyle = g;
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();

  // rails
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "rgba(210, 240, 255, 0.09)";
  const n = 10;
  for (let i = 0; i < n; i++) {
    ctx.fillRect(s.x + 14 + i * (s.w / n), s.y + 8, 2, s.h - 16);
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawHeader(ctx: CanvasRenderingContext2D, h: Header) {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.30)";
  roundRect(ctx, h.x + 6, h.y + 8, h.w, h.h, 10);
  ctx.fill();

  ctx.fillStyle = "rgba(18, 22, 32, 0.98)";
  roundRect(ctx, h.x, h.y, h.w, h.h, 10);
  ctx.fill();

  // pins
  const cols = Math.max(6, Math.floor(h.w / 18));
  const rows = 2 + Math.floor((h.h - 14) / 14);
  ctx.globalAlpha = 0.92;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = h.x + 10 + (c * (h.w - 20)) / (cols - 1);
      const py = h.y + 10 + (r * (h.h - 20)) / (rows - 1);
      ctx.fillStyle = "rgba(210, 180, 120, 0.32)";
      ctx.fillRect(px - 2.1, py - 2.1, 4.2, 4.2);
      ctx.fillStyle = "rgba(255, 240, 210, 0.12)";
      ctx.fillRect(px - 1.2, py - 1.2, 2.4, 2.4);
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawInductor(ctx: CanvasRenderingContext2D, ind: Inductor, t: number, voltage: number) {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  roundRect(ctx, ind.x + 7, ind.y + 9, ind.w, ind.h, 12);
  ctx.fill();

  const g = ctx.createLinearGradient(ind.x, ind.y, ind.x + ind.w, ind.y + ind.h);
  g.addColorStop(0, "rgba(92, 104, 124, 0.94)");
  g.addColorStop(1, "rgba(34, 42, 56, 0.94)");
  ctx.fillStyle = g;
  roundRect(ctx, ind.x, ind.y, ind.w, ind.h, 12);
  ctx.fill();

  // subtle energized edge
  if (voltage > 0.01) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.6 + ind.seed * 8.0);
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = `rgba(255, 200, 120, ${0.06 + 0.16 * voltage * pulse})`;
    ctx.lineWidth = 3;
    roundRect(ctx, ind.x, ind.y, ind.w, ind.h, 12);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCap(ctx: CanvasRenderingContext2D, c: Cap, t: number, voltage: number) {
  ctx.save();

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(c.x + 6, c.y + 8, c.r * 1.0, c.r * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // body
  const g = ctx.createLinearGradient(c.x - c.r, c.y - c.r, c.x + c.r, c.y + c.r);
  g.addColorStop(0, "rgba(80, 95, 120, 0.92)");
  g.addColorStop(1, "rgba(28, 36, 52, 0.92)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, c.r, c.r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();

  // highlight strip
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.ellipse(c.x - c.r * 0.25, c.y - c.r * 0.05, c.r * 0.35, c.r * 0.65, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (voltage > 0.01) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.3 + c.seed * 9.0);
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = `rgba(255, 170, 80, ${0.04 + 0.12 * voltage * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.r + 2, c.r * 0.85 + 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawChip(ctx: CanvasRenderingContext2D, c: Chip, t: number, voltage: number) {
  ctx.save();

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.40)";
  roundRect(ctx, c.x + 10, c.y + 12, c.w, c.h, 14);
  ctx.fill();

  // body
  const g = ctx.createLinearGradient(c.x, c.y, c.x + c.w, c.y + c.h);
  g.addColorStop(0, "rgba(20, 24, 34, 0.98)");
  g.addColorStop(1, "rgba(10, 12, 18, 0.98)");
  ctx.fillStyle = g;
  roundRect(ctx, c.x, c.y, c.w, c.h, 14);
  ctx.fill();

  // bevel
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  roundRect(ctx, c.x + 2, c.y + 2, c.w - 4, c.h - 4, 12);
  ctx.stroke();

  // pins
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "rgba(200, 180, 130, 0.22)";
  const pinCount = Math.max(8, Math.floor(c.w / 18));
  for (let i = 0; i < pinCount; i++) {
    const px = c.x + 10 + (i * (c.w - 20)) / (pinCount - 1);
    ctx.fillRect(px - 1.5, c.y - 6, 3, 6);
    ctx.fillRect(px - 1.5, c.y + c.h, 3, 6);
  }
  ctx.globalAlpha = 1;

  // voltage highlight
  const hot = chipHeat(c, t, voltage);
  if (hot > 0.01) {
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = `rgba(255, 220, 140, ${0.06 + 0.20 * hot})`;
    ctx.lineWidth = 3;
    roundRect(ctx, c.x, c.y, c.w, c.h, 14);
    ctx.stroke();
  }

  ctx.restore();
}

function drawVias(ctx: CanvasRenderingContext2D, vias: Via[], t: number, voltage: number) {
  ctx.save();

  for (const v of vias) {
    // tiny ring
    ctx.fillStyle = "rgba(180, 220, 255, 0.16)";
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.r + 1.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(20, 30, 48, 0.85)";
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.r * 0.65, 0, Math.PI * 2);
    ctx.fill();

    if (voltage > 0.01) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + v.seed * 10.0);
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `rgba(255, 160, 70, ${0.02 + 0.05 * voltage * pulse})`;
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.r + 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
  }

  ctx.restore();
}

function drawSilk(ctx: CanvasRenderingContext2D, silks: Silk[]) {
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "rgba(220, 250, 255, 0.40)";
  ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  for (const s of silks) {
    ctx.fillText(s.text, s.x, s.y);
  }
  ctx.restore();
}

function drawVoltageSweep(ctx: CanvasRenderingContext2D, t: number, voltage: number) {
  if (voltage <= 0.01) return;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const sweepX = -860 + ((t * 240) % 1720); // repeat across board
  const g = ctx.createRadialGradient(sweepX, 0, 10, sweepX, 0, 320);
  g.addColorStop(0, `rgba(255, 190, 90, ${0.10 * voltage})`);
  g.addColorStop(0.35, `rgba(255, 150, 60, ${0.06 * voltage})`);
  g.addColorStop(1, "rgba(255, 150, 60, 0)");

  ctx.fillStyle = g;
  ctx.fillRect(-1200, -800, 2400, 1600);
  ctx.restore();
}

/* -----------------------
   Helpers
------------------------ */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function chipHeat(c: Chip, t: number, voltage: number) {
  const on = c.onAt;
  const off = c.offAt;
  const seed = c.heatSeed;

  const rampIn = clamp01((t - on) / 0.6);
  const rampOut = clamp01((t - off) / 0.7);
  const heat = easeOutCubic(rampIn) * (1 - easeOutCubic(rampOut));

  const wob = 0.85 + 0.15 * Math.sin(t * 2.0 + seed * 10.0);
  return heat * wob * voltage;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

/* Deterministic RNG */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (t >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

