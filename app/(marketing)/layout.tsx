// app/(marketing)/layout.tsx
import type { ReactNode } from "react";
import { Footer } from "./_components/footer";
import { Heading } from "./_components/heading";
import VoiceVisualizerGate from "@/components/voice-visualizer-gate";

type MarketingLayoutProps = { children: ReactNode };

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
      <Heading />

      <main className="relative flex-1 flex items-start md:items-center">
        <div className="mx-auto w-full max-w-6xl px-4">
          {children}
        </div>
      </main>

      <VoiceVisualizerGate />
      <Footer />
    </div>
  );
}
