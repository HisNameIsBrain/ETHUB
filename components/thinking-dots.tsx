"use client";
import * as React from "react";

type Props = {
  label?: string;        // text before the dots
  size?: "sm" | "md";    // tweak dot size
  className?: string;    // optional wrapper classes
};

export default function ThinkingDots({ label = "Thinking", size = "md", className = "" }: Props) {
  const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-live="polite" aria-atomic="true">
      <span>{label}</span>
      <span className="inline-flex items-end gap-1" aria-hidden="true">
        <span className={`rounded-full bg-blue-500/90 ${dotSize} ethub-dot`} style={{ animationDelay: "0ms" }} />
        <span className={`rounded-full bg-blue-500/90 ${dotSize} ethub-dot`} style={{ animationDelay: "180ms" }} />
        <span className={`rounded-full bg-blue-500/90 ${dotSize} ethub-dot`} style={{ animationDelay: "360ms" }} />
      </span>

      {/* local, component-scoped keyframes */}
      <style>{`
        @keyframes ethub-wave {
          0%   { transform: translateY(0);   opacity: .25; }
          35%  { transform: translateY(-3px); opacity: 1;   }
          70%  { transform: translateY(0);   opacity: .5;  }
          100% { transform: translateY(0);   opacity: .25; }
        }
        .ethub-dot {
          animation: ethub-wave 900ms ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>
    </span>
  );
}
