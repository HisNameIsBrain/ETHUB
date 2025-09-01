"use client";

import { SiriGlow } from "@/components/siri-glow";

export default function SiriPreviewPage() {
  return (
    <>
      <SiriGlow />

      <div className="relative z-[99] flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors">
        <h1 className="text-4xl font-bold mb-4">🌈 Siri Glow Preview</h1>
        <p className="text-lg max-w-xl text-center">
          This is the iOS-inspired floating rainbow animation rendered entirely
          in CSS. It uses a conic gradient to simulate the Siri plasma effect.
        </p>
      </div>
    </>
  );
}
