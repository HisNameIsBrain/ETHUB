"use client";

import { useMemo } from "react";

type SiriBubbleProps = {
  size?: number;
  hue?: number;
  intensity?: number; // 0..1
  className?: string;
};

export default function SiriBubble({
  size = 64,
  hue = 280,
  intensity = 1,
  className = "",
}: SiriBubbleProps) {
  const a = Math.max(0, Math.min(1, intensity));
  const colors = useMemo(() => {
    const c1 = `hsla(${hue},100%,55%,${0.35 * a})`;
    const c2 = `hsla(${(hue + 60) % 360},100%,60%,${0.5 * a})`;
    const c3 = `hsla(${(hue + 120) % 360},100%,65%,${0.7 * a})`;
    return { c1, c2, c3 };
  }, [hue, a]);

  const dots = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const t = (i / 10) * Math.PI * 2;
      const r = size * 0.36;
      const x = Math.cos(t) * r + size / 2;
      const y = Math.sin(t) * r + size / 2;
      return {
        left: `${(x - 3).toFixed(2)}px`,
        top: `${(y - 3).toFixed(2)}px`,
        delay: `${(i * 0.08).toFixed(2)}s`,
      };
    });
  }, [size]);

  return (
    <div
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden
    >
      {/* base soft glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(36% 36% at 50% 50%, ${colors.c3} 0%, transparent 70%)`,
          filter: "blur(18px)",
        }}
      />

      {/* rotating conic ring (inside bubble) */}
      <div
        className="absolute inset-[-20%] animate-[spin_2.5s_linear_infinite]"
        style={{
          background: `conic-gradient(from 0deg, ${colors.c1}, ${colors.c2}, ${colors.c3}, ${colors.c1})`,
          WebkitMask:
            "radial-gradient(circle, transparent 38%, black 40%), radial-gradient(circle, black 64%, transparent 66%)",
          WebkitMaskComposite: "xor",
          filter: "blur(8px)",
          borderRadius: "50%",
        }}
      />

      {/* pulsing core */}
      <div
        className="absolute inset-0 animate-[pulseFast_1s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(22% 22% at 50% 50%, ${colors.c2} 0%, transparent 70%)`,
          filter: "blur(6px)",
        }}
      />

      {/* twinkles */}
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{
            left: d.left,
            top: d.top,
            background: `radial-gradient(circle at 30% 30%, white 0%, ${colors.c2} 45%, transparent 70%)`,
            filter: "blur(0.5px)",
            animation: `twinkleFast 1s ease-in-out ${d.delay} infinite`,
          }}
        />
      ))}

      {/* outer bloom */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ boxShadow: `0 0 ${8 + 10 * a}px ${2 + 4 * a}px rgba(160,120,255,${0.25 * a})` }}
      />

      <style jsx>{`
        @keyframes twinkleFast {
          0%, 100% { transform: scale(0.7); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes pulseFast {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.animate-[spin_2.5s_linear_infinite]) { animation: none !important; }
          :global(.animate-[pulseFast_1s_ease-in-out_infinite]) { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
