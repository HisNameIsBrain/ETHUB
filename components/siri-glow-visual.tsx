"use client";

import { motion } from "framer-motion";

type Props = {
  widthPct: number;            // 0..100
  position?: "top" | "bottom";
  height?: string;             // e.g. "4px"
  className?: string;
  glowStrength?: number;
  overflow?: number;
  speedSec?: number;
  thickness?: number;          // >= 1
  visible?: boolean;
};

export default function SiriGlowVisual({
  widthPct,
  position = "top",
  height = "4px",
  className = "",
  glowStrength = 14,
  overflow = 18,
  speedSec = 1.6,
  thickness = 1.25,
  visible = true,
}: Props) {
  const gradient =
    "linear-gradient(90deg, hsl(330 100% 60%), hsl(20 100% 55%), hsl(55 100% 55%), hsl(140 100% 50%), hsl(195 100% 55%), hsl(260 100% 60%), hsl(315 100% 60%))";

  const hPx = Number.parseFloat(height);
  const thickPx = Number.isFinite(hPx) ? `${(hPx * thickness).toFixed(2)}px` : height;
  const vw = `${Math.max(0, Math.min(100, widthPct))}%`;
  const op = visible ? 1 : 0;

  return (
    <>
      <motion.div
        className={`pointer-events-none fixed ${position}-0 left-0 z-50 ${className}`}
        style={{
          height: `calc(${height} + ${overflow * 2}px)`,
          [position]: `-${overflow}px`,
          width: vw,
          filter: `blur(${glowStrength}px) saturate(1.15)`,
          opacity: op * 0.65,
          background: gradient,
          backgroundSize: "400% 100%",
          willChange: "transform, background-position",
        } as React.CSSProperties}
        animate={{
          y: position === "top" ? [0, overflow * 0.6, 0, -overflow * 0.4, 0] : [0, -overflow * 0.6, 0, overflow * 0.4, 0],
          transition: { duration: speedSec * 1.8, repeat: Infinity, ease: "easeInOut" },
          backgroundPosition: ["0% 50%", "100% 50%"],
        }}
      />

      <motion.div
        className={`pointer-events-none fixed ${position}-0 left-0 z-50 ${className}`}
        style={{
          height: thickPx,
          width: vw,
          background: "transparent",
          boxShadow: `0 0 22px 6px rgba(255,255,255,0.22)`,
          opacity: op,
        }}
      />

      <motion.div
        className={`fixed ${position}-0 left-0 z-50 ${className}`}
        style={{
          height: thickPx,
          width: vw,
          opacity: op,
          background: gradient,
          backgroundSize: "400% 100%",
          willChange: "background-position",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%"],
        }}
        transition={{ duration: speedSec, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className={`pointer-events-none fixed ${position}-0 left-0 z-50 ${className}`}
        style={{
          height: "2px",
          width: vw,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0))",
          opacity: op * 0.9,
          filter: "blur(0.3px)",
          transform: position === "top" ? "translateY(-2px)" : "translateY(2px)",
        }}
        animate={{ x: ["0%", "2%", "0%"] }}
        transition={{ duration: speedSec * 0.9, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}
