"use client";
import * as React from "react";
import { useAudioAnalyser } from "@/hooks/useAudioAnalyser";
import { SiriGlowInvert } from "@/components/siri-glow-invert";

export default function SiriGlowVisualizer({
  stream,
  mediaEl,
  idle,
  className,
}: {
  stream?: MediaStream | null;
  mediaEl?: HTMLAudioElement | null;
  idle?: boolean;
  className?: string;
}) {
  const source = mediaEl ?? stream ?? null;
  const levels = useAudioAnalyser(source);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const frame = React.useRef<number>();

  React.useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const start = performance.now();
    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // amplitude (normalized)
      const amp = (idle || !levels?.length)
        ? 0.12 + 0.05 * Math.sin(t / 1000)
        : Math.min(1, levels.reduce((a, b) => a + b, 0) / levels.length);

      // multiple rainbow ribbons
      drawRibbon(ctx, w, h, t * 0.002, amp, [
        "rgba(255,242,0,0.85)",
        "rgba(255,0,122,0.85)",
        "rgba(0,72,255,0.85)",
        "rgba(0,255,162,0.85)",
      ]);
      drawRibbon(ctx, w, h, t * 0.002 + 2, amp * 0.7, [
        "rgba(255,138,0,0.7)",
        "rgba(122,0,255,0.7)",
        "rgba(0,162,255,0.7)",
      ]);

      frame.current = requestAnimationFrame(() =>
        draw(performance.now() - start)
      );
    };
    draw(performance.now() - start);

    return () => {
      cancelAnimationFrame(frame.current!);
      ro.disconnect();
    };
  }, [levels, idle]);

  return (
    <div className={["relative", className].filter(Boolean).join(" ")}>
      {/* Outer SiriGlow ring */}
      <SiriGlowInvert
        rotateSec={3.5}
        innerRotateSec={4.8}
        blurPx={12}
        insetPercent={-5}
        opacity={0.8}
        thicknessPx={10}
        inner
        className="absolute inset-0"
      />
      {/* Ribbon canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

function drawRibbon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  phase: number,
  amp: number,
  colors: string[]
) {
  ctx.save();
  ctx.translate(w / 2, h / 2);

  const width = w * 0.9;
  const height = h * (0.12 + 0.25 * amp);

  const grad = ctx.createLinearGradient(0, -height, 0, height);
  colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));

  ctx.fillStyle = grad;
  ctx.globalCompositeOperation = "lighter";

  ctx.beginPath();
  for (let x = -width / 2; x <= width / 2; x += 6) {
    const y =
      Math.sin((x / width) * Math.PI * 6 + phase) * height * 0.5 +
      Math.sin((x / width) * Math.PI * 3 - phase) * height * 0.3;
    if (x === -width / 2) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let x = width / 2; x >= -width / 2; x -= 6) {
    const y =
      Math.sin((x / width) * Math.PI * 6 + phase + Math.PI / 12) * height * 0.5 +
      Math.sin((x / width) * Math.PI * 3 - phase + Math.PI / 6) * height * 0.3;
    ctx.lineTo(x, y + 10);
  }
  ctx.closePath();
  ctx.fill();

  ctx.restore();
  ctx.globalCompositeOperation = "source-over";
}
