// components/siri-glow.tsx
"use client";
import { useEffect, useState } from "react";

type Props = { height?: string; position?: "top" | "bottom"; className?: string };

function SiriGlowImpl({ height = "4px", position = "top", className = "" }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const posClass = position === "top" ? "top-0" : "bottom-0";
  return (
    <div className={`fixed left-0 w-full ${posClass} z-[100] pointer-events-none ${className}`}>
      <div
        className="h-[var(--siri-glow-height,4px)] w-full blur-xl opacity-90"
        style={{
          background:
            "linear-gradient(90deg, rgba(131,56,236,1) 0%, rgba(58,134,255,1) 25%, rgba(0,212,255,1) 50%, rgba(58,134,255,1) 75%, rgba(131,56,236,1) 100%)",
          backgroundSize: "200% 100%",
          animation: "siriSweep 1.6s linear infinite",
          ["--siri-glow-height" as any]: height,
        }}
      />
      <style>{`@keyframes siriSweep { from { background-position: 0% 50% } to { background-position: 200% 50% } }`}</style>
    </div>
  );
}

export const SiriGlow = SiriGlowImpl;
export default SiriGlowImpl;
