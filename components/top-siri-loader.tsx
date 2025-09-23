"use client";
import * as React from "react";
import { SiriGlow } from "@/components/siri-glow";

export default function TopSiriLoader() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[96] h-1.5">
      <div className="mx-auto h-full w-[96%] overflow-hidden rounded-full bg-white/10">
        <div className="relative h-full w-full blur-[2px] opacity-90">
          <SiriGlow rotateSec={5.2} innerRotateSec={6.4} blurPx={12} insetPercent={-6} opacity={0.8} thicknessPx={10} inner />
        </div>
      </div>
    </div>
  );
}
