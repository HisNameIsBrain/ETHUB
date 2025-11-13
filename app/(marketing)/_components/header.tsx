"use client";

import { useRef, useEffect } from "react";

type MatrixRainProps = {
  opacityMin?: number;    // 0..1
  opacityMax?: number;    // 0..1
  letters?: string;
  speedScale?: number;    // 0.5..2
};

export function MatrixRain({
  opacityMin = 0.4,
  opacityMax = 0.75,
  letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ETHUB",
  speedScale = 1,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Larger font sizes
    const fontSizes = [28, 32, 36, 42, 48];

    const columns = Math.floor(width / 40); // wider spacing for big letters
    const drops = Array(columns).fill(0);

    const randomOpacity = () =>
      opacityMin + Math.random() * (opacityMax - opacityMin);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        const fontSize = fontSizes[Math.floor(Math.random() * fontSizes.length)];

        ctx.font = `${fontSize}px monospace`;
        ctx.fillStyle = `rgba(0, 255, 0, ${randomOpacity()})`;

        ctx.fillText(text, i * 40, drops[i] * fontSize);

        // Move down
        drops[i] += speedScale;

        if (drops[i] * fontSize > height && Math.random() > 0.97) {
          drops[i] = 0;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current!);
      window.removeEventListener("resize", resize);
    };
  }, [letters, opacityMin, opacityMax, speedScale]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
