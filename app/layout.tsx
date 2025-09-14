"use client";

import "./globals.css";
import { Suspense } from "react";
import ClientSEO from "@/components/client-seo";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/app/(marketing)/_components/navbar";
import TopSiriLoader from "@/components/top-siri-loader";
import { SiriGlowInvert } from "@/components/siri-glow-invert";
import AssistantLauncher from "@/components/assistant-launcher";
import VoiceVisualizerGate from "@/components/voice-visualizer-gate";

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* Client-side title/meta to avoid server metadata */}
        <ClientSEO
          title="ETHUB"
          description="Tech Hub platform"
          metas={[
            { name: "theme-color", content: "#0f172a" },
            { property: "og:title", content: "ETHUB" },
            { property: "og:description", content: "Tech Hub platform" },
          ]}
        />

        <ConvexClientProvider>
          <TooltipProvider>
            {/* Top navigation */}
            <Navbar />

            {/* Global top UI effects */}
            <TopSiriLoader />
            <SiriGlowInvert />

            {/* Page content */}
            <Suspense fallback={null}>{children}</Suspense>

            {/* Assistant + voice features */}
            <AssistantLauncher />
            <VoiceVisualizerGate />

            {/* Global toaster */}
            <Toaster richColors />
          </TooltipProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
