"use client";

import * as React from "react";
import { SiriGlow } from "@/components/siri-glow";

export function AvatarRing({
  children,
  sizePx = 36,
  ring = 3,
  radiusBlur = 12,
  className = "",
}: {
  children: React.ReactNode;
  sizePx?: number;
  ring?: number;
  radiusBlur?: number;
  className?: string;
}) {
  const outer = `${sizePx}px`;
  const ringInset = `-${ring}px`; // expand SiriGlow beyond the container to keep the ring vivid

  return (
    <span
      className={`group relative inline-grid place-items-center rounded-full ${className}`}
      style={{
        width: outer,
        height: outer,
      }}
    >
      {/* Animated sweep, masked to a ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          // Expand slightly so the ring color bleeds to the very edge
          inset: ringInset,
          borderRadius: "9999px",
          overflow: "hidden",
          // Mask: keep only the outer ring area
          WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 0)`,
          mask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 0)`,
        }}
      >
        <SiriGlow auto speedSec={2.2} thickness={1.1} glowStrength={12} overflow={8} />
      </span>

      {/* Soft ambient glow around the ring (optional) */}
      {radiusBlur > 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            filter: `blur(${radiusBlur}px)`,
            borderRadius: "9999px",
            WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 0)`,
            mask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 0)`,
          }}
        >
          <SiriGlow auto speedSec={2.2} thickness={1.1} glowStrength={12} overflow={8} />
        </span>
      )}

      {/* Inner avatar container (interactive) */}
      <span
        className="relative z-[1] inline-flex items-center justify-center rounded-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow ring-1 ring-black/5"
        style={{
          width: `${sizePx - ring * 2}px`,
          height: `${sizePx - ring * 2}px`,
        }}
      >
        {children}
      </span>
    </span>
  );
}
