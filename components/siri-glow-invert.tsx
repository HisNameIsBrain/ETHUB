"use client";

import * as React from "react";

type Props = { className?: string; show?: boolean };

export function SiriGlowInvert({ className = "", show = true }: Props) {
  if (!show) return null;
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-10 mix-blend-difference ${className}`}
      aria-hidden="true"
    >
      <div className="mx-auto h-1 w-full overflow-hidden">
        <div className="h-full w-[200%] animate-[siriInvert_1.8s_ease-in-out_infinite] bg-gradient-to-r from-emerald-400 via-sky-500 to-fuchsia-500" />
      </div>
      <style jsx global>{`
        @keyframes siriInvert {
          0%   { transform: translateX(50%); }
          50%  { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
export default SiriGlowInvert;
