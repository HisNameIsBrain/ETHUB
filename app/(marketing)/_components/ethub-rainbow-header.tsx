"use client";

import { useEffect, useRef } from "react";

type EthubMatrixBgProps = {
  height?: number;
};

type Glyph = {
  x: number;
  y: number;
  speed: number;
  size: number;
  char: string;
  alpha: number;
};

export default function EthubMatrixBg({ height = 520 }: EthubMatrixBgProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Force devicePixelRatio crispness
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = "100%";
    canvas.style.height = height + "px";
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    let w = canvas.offsetWidth;
    let h = height;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZETHUBMG1293456780";
    const glyphs: Glyph[] = [];

    const pickChar = () => letters[(Math.random() * letters.length) | 0];

    // number of letters
    const count = Math.floor((w * h) / 6000) + 20;

    const spawnGlyph = (above = true): Glyph => {
      const sizePool = [14, 16, 18, 20, 22, 24];
      const size = sizePool[(Math.random() * sizePool.length) | 0];

      // speed 2x–8x
      const speedBase = 2 + Math.random() * 10;
      const speedFactor = 2 + Math.random() * 5;

      return {
        x: Math.random() * w,
        y: above ? -Math.random() * h - size * 1 : Math.random() * h,
        speed: speedBase * speedFactor,
        size,
        char: pickChar(),
        alpha: 0.18 + Math.random() * 0.15 // ALWAYS < 0.5 (no white blobs)
      };
    };

    for (let i = 0; i < count; i++) glyphs.push(spawnGlyph(true));

    let last = performance.now();

    const draw = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      // transparent wipe
      ctx.clearRect(0, 0, w, h);

      // update
      for (const g of glyphs) {
        g.y += g.speed * dt;
        if (g.y > h + g.size * 2) {
          const r = spawnGlyph(true);
          g.x = r.x;
          g.y = r.y;
          g.speed = r.speed;
          g.size = r.size;
          g.char = r.char;
          g.alpha = r.alpha;
        }
      }

      // avoid rows — sort and enforce spacing
      const sorted = [...glyphs].sort((a, b) => a.y - b.y);
      let lastY = -9999;
      const minGap = 26; // space between letters vertically

      for (const g of sorted) {
        if (g.y - lastY < minGap) continue;
        lastY = g.y;

        ctx.font = `700 ${g.size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.textBaseline = "top";

        // crisp dark gray only
        ctx.fillStyle = `rgba(30,30,30,${g.alpha})`;

        ctx.fillText(g.char, g.x, g.y);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    // resize
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;

      w = canvas.offsetWidth;
      h = height;

      canvas.width = w * dpr;
      canvas.height = h * dpr;

      ctx.scale(dpr, dpr);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(canvas);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [height]);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-0"
      style={{ height }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
