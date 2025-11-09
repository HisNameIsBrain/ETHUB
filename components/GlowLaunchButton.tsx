"use client";
import React from "react";

type Props = { label?: string; size?: number; innerPct?: number };
export default function GlowLaunchButton({ label="Start", size=112, innerPct=85 }: Props) {
  const inner = Math.max(60, Math.min(98, innerPct));
  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{ width: size, height: size }}
      data-ethub="glow-launcher"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 blur-md animate-pulse" />
      <button
        className="relative z-10 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition focus:outline-none focus:ring-2 focus:ring-white/20"
        style={{ width: `${inner}%`, height: `${inner}%` }}
        type="button"
      >
        {label}
      </button>
    </div>
  );
}
