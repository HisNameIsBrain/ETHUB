// components/GlowLaunchButton.tsx
"use client";
import React from "react";

export default function GlowLaunchButton({
  label = "Start",
  size = 144,       // overall launcher diameter
  innerPct = 84,    // button relative size (fills launcher slightly smaller)
  onClick,
}: {
  label?: string;
  size?: number;
  innerPct?: number;
  onClick?: () => void;
}) {
  const pct = Math.min(98, Math.max(70, innerPct));
  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 blur-md" />
      <button
        type="button"
        onClick={onClick}
        className="relative z-10 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/20"
        style={{ width: `${pct}%`, height: `${pct}%` }}
      >
        {label}
      </button>
    </div>
  );
}
