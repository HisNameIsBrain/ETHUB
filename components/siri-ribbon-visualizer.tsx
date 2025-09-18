"use client";

import * as React from "react";
import { useAudioAnalyser } from "@/hooks/useAudioAnalyser";

type Props = {
  className?: string;
  // If you want to drive it manually you can pass either:
  stream?: MediaStream | null;         // mic stream
  mediaEl?: HTMLAudioElement | null;   // the TTS <audio> element
  idle?: boolean;                      // force idle animation
};

export default function SiriRibbonVisualizer({ className, stream, mediaEl, idle }: Props) {
  const source = mediaEl ?? stream ?? null;
  const levels = useAudioAnalyser(source);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const frame = React.useRef<number | null>(null);
  const start = React.useRef<number>(performance.now());

  React.useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.floor(clientWidth * dpr);
      canvas.height = Math.floor(clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // background subtle glow rings
      const ringThickness = Math.max(4, Math.min(w, h) * 0.06);
      const ringInset = 6;
      const angle = (t / 1600) % (2 * Math.PI);
      const angle2 = (t / 2100) % (2 * Math.PI);

      // ring 1
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(angle);
      const r1 = Math.min(w, h) / 2 - ringInset;
      drawConicRing(ctx, r1, ringThickness, 0.75);
      ctx.restore();

      // ring 2
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-angle2);
      const r2 = Math.min(w, h) / 2 - ringInset - ringThickness * 0.6;
      drawConicRing(ctx, r2, ringThickness * 0.7, 0.6);
      ctx.restore();

      // amplitude from analyser
      const amp = (idle || !levels?.length)
        ? 0.15 + 0.05 * Math.sin(t / 800)
        : Math.min(1, levels.reduce((a, b) => a + b, 0) / levels.length) * 0.9;

      // Siri-like ribbons
      drawRibbon(ctx, w, h, t, amp, 0, 1.0);
      drawRibbon(ctx, w, h, t + 1234, amp * 0.85, 1, 0.9);
      drawRibbon(ctx, w, h, t + 2678, amp * 0.7, 2, 0.85);

      frame.current = requestAnimationFrame(() => draw(performance.now() - start.current));
    };

    draw(performance.now() - start.current);

    return () => {
      cancelAnimationFrame(frame.current ?? 0);
      ro.disconnect();
    };
  }, [levels, idle]);

  return (
    <div className={["relative overflow-hidden", className].filter(Boolean).join(" ")}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

function drawConicRing(
  ctx: CanvasRenderingContext2D,
  radius: number,
  thickness: number,
  opacity = 0.8
) {
  const grd = ctx.createConicGradient(0, 0, 0);
  // rainbow akin to your SiriGlow colors
  const stops = [
    "rgba(255,242,0,1)",
    "rgba(255,138,0,1)",
    "rgba(255,0,122,1)",
    "rgba(122,0,255,1)",
    "rgba(0,72,255,1)",
    "rgba(0,162,255,1)",
    "rgba(0,255,162,1)",
    "rgba(160,255,0,1)",
  ];
  stops.forEach((c, i) => grd.addColorStop(i / stops.length, c));
  ctx.strokeStyle = grd;
  ctx.globalAlpha = opacity;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.arc(0, 0, radius - thickness / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawRibbon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  amp: number,
  seed: number,
  opacity: number
) {
  const cx = w / 2, cy = h / 2;
  const width = Math.min(w, h) * 0.85;
  const height = Math.min(w, h) * (0.18 + 0.22 * amp);
  const phase = (t / 900) + seed * 0.8;

  const grd = ctx.createLinearGradient(0, cy - height, 0, cy + height);
  const colors = [
    "rgba(255,242,0,0.85)",
    "rgba(255,0,122,0.85)",
    "rgba(0,72,255,0.85)",
    "rgba(0,255,162,0.85)",
  ];
  colors.forEach((c, i) => grd.addColorStop(i / (colors.length - 1), c));

  const k = 6; // curvature frequency
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = opacity;
  ctx.fillStyle = grd;

  ctx.beginPath();
  for (let x = -width / 2; x <= width / 2; x += 6) {
    const y = Math.sin((x / width) * Math.PI * k + phase) * height * 0.5
      + Math.sin((x / width) * Math.PI * (k * 0.5) - phase * 1.3) * height * 0.3;
    if (x === -width / 2) ctx.moveTo(cx + x, cy + y);
    else ctx.lineTo(cx + x, cy + y);
  }
  for (let x = width / 2; x >= -width / 2; x -= 6) {
    const y = Math.sin((x / width) * Math.PI * k + phase + Math.PI / 14) * height * 0.5
      + Math.sin((x / width) * Math.PI * (k * 0.5) - phase * 1.3 + Math.PI / 7) * height * 0.3;
    ctx.lineTo(cx + x, cy + y + 8); // thickness offset
  }
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}
