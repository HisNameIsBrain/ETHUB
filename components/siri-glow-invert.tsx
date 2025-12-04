"use client";
import * as React from "react";

type Props = {
  className?: string;
  /** Reverse the color order */
  reverse?: boolean;
  /** Seconds for the outer ring’s full rotation */
  rotateSec?: number;
  /** Seconds for the inner ring’s full rotation */
  innerRotateSec?: number;
  /** Blur radius (px) applied to the glow */
  blurPx?: number;
  /** Negative grows outward, positive tucks inward */
  insetPercent?: number;
  /** Opacity of the glow layer (0..1) */
  opacity?: number;
  /** Ring thickness (px) */
  thicknessPx?: number;
  /** Custom conic colors */
  colors?: string[];
  /** Render inner counter-rotating ring */
  inner?: boolean;
  /** z-index for the glow (defaults under content) */
  zIndex?: number;
};

const COLORS_BRIGHT_TO_DARK = [
  "rgba(255,242,0,0.9)",
  "rgba(255,138,0,0.9)",
  "rgba(255,0,122,0.9)",
  "rgba(122,0,255,0.9)",
  "rgba(0,72,255,0.9)",
  "rgba(0,162,255,0.9)",
  "rgba(0,255,162,0.9)",
  "rgba(160,255,0,0.9)",
];

function ringMask(thicknessPx: number) {
  const t = Math.max(6, thicknessPx);
  const a = t - 1;
  return `radial-gradient(circle, transparent calc(50% - ${t}px), #000 calc(50% - ${a}px), #000 calc(50% + ${a}px), transparent calc(50% + ${t}px))`;
}

export function SiriGlowInvert({
  className = "",
  reverse = false,
  rotateSec = 3.8,
  innerRotateSec = 4.8,
  blurPx = 14,
  insetPercent = -6,
  opacity = 0.8,
  thicknessPx = 10,
  colors = COLORS_BRIGHT_TO_DARK,
  inner = true,
  zIndex = 0,
}: Props) {
  const stops = React.useMemo(
    () => (reverse ? [...colors].reverse() : colors),
    [colors, reverse]
  );

  const conic = React.useMemo(
    () => `conic-gradient(from 0deg, ${stops.join(", ")})`,
    [stops]
  );

  const mask = React.useMemo(() => ringMask(thicknessPx), [thicknessPx]);

  // Common base style shared by both rings
  const base: React.CSSProperties = {
    position: "absolute",
    inset: `${insetPercent}%`,
    filter: `blur(${blurPx}px)`,
    opacity,
    background: conic,
    WebkitMaskImage: mask,
    maskImage: mask,
    willChange: "transform",
    pointerEvents: "none",
    zIndex,
  };

  const outerStyle: React.CSSProperties = {
    ...base,
    animation: `siri-spin-rev ${rotateSec}s linear infinite`,
  };

  const innerStyle: React.CSSProperties = {
    ...base,
    inset: `${Math.max(insetPercent + 4, -2)}%`,
    filter: `blur(${Math.max(blurPx - 6, 6)}px)`,
    opacity: Math.min(opacity * 0.85, 1),
    animation: `siri-spin ${innerRotateSec}s linear infinite`,
    mixBlendMode: "normal",
  };

  return (
    <>
      <span aria-hidden className={`rounded-full ${className}`} style={outerStyle} />
      {inner && <span aria-hidden className="rounded-full" style={innerStyle} />}
      {/* Self-contained keyframes; avoids touching global CSS */}
      <style>{`
        @keyframes siri-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes siri-spin-rev { from { transform: rotate(360deg) } to { transform: rotate(0deg) } }
        @media (prefers-reduced-motion: reduce) {
          .siri-reduce-motion, [style*="siri-spin"] {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </>
  );
}
