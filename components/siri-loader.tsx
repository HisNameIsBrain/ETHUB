// components/siri-loader.tsx
"use client";

import * as React from "react";

export function SiriLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-8 w-8 ${className}`}>
      <span className="absolute inset-0 rounded-full ring-2 ring-foreground/30 animate-[siriPulse_1.6s_ease-in-out_infinite]" />
      <span className="absolute inset-1 rounded-full ring-2 ring-foreground/25 animate-[siriPulse_1.6s_ease-in-out_infinite] [animation-delay:0.2s]" />
      <span className="absolute inset-2 rounded-full ring-2 ring-foreground/20 animate-[siriPulse_1.6s_ease-in-out_infinite] [animation-delay:0.4s]" />
    </div>
  );
}
