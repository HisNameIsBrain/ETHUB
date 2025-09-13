"use client";

import type { ReactNode } from "react";
import { Footer } from "./_components/footer";
import { Navbar } from "./_components/navbar";
import { Heading } from "./_components/heading";
import AssistantLauncher from "@/components/assistant-launcher";
import VoiceVisualizerGate from "@/components/voice-visualizer-gate";
import TopSiriLoader from "@/components/top-siri-loader";
import SiriGlowRing from "@/components/siri-glow";

type MarketingLayoutProps = { children: ReactNode };

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <TopSiriLoader />
      <Navbar />
      <Heading />

      <main className="relative flex-1 flex items-start md:items-center">
        {/* centered page container */}
        <div className="mx-auto w-full max-w-6xl px-4">
          {children}
        </div>

        {/* decorative glow, kept inside main but non-blocking */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5">
          <div className="mx-auto h-full w-[96%] overflow-hidden rounded-full bg-white/10">
            <div className="relative h-full w-full blur-[2px] opacity-90">
              <SiriGlowRing />
            </div>
          </div>
        </div>
      </main>

      <AssistantLauncher />
      <VoiceVisualizerGate />
      <Footer />
    </div>
  );
}
