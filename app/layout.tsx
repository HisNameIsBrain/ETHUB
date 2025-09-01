"use client";
// app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

// Providers & UI
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
// Floating Build Assistant AI Ollama 
import FloatingBuildAssistant from "@/components/FloatingBuildAssistant";
// App chrome
import { Navbar } from "@/app/(marketing)/_components/navbar";

// Siri-style bubble (animated ring)
import { SiriGlow } from "@/components/siri-glow";

export const metadata: Metadata = {
  title: "ETHUB",
  description: "Tech Hub platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ConvexClientProvider>
          <TooltipProvider>
            <Navbar />

            <main className="min-h-[calc(100vh-4rem)]">
              <Suspense fallback={null}>{children}</Suspense>
            </main>

            <Toaster richColors />

            {/* Siri chat bubble — fixed, non-intrusive */}
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
              <span className="sr-only">Open assistant</span>
              <button
                aria-label="Open assistant"
                className="group relative grid h-14 w-14 place-items-center rounded-full border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-lg hover:shadow-xl transition-all"
                onClick={() => {
                  const evt = new CustomEvent(&quot;siri-bubble:open&quot;);
                  window.dispatchEvent(evt);
                }}
              >
                <SiriGlow className="pointer-events-none absolute inset-0" />
                {/* inner dot */}
                <div className="relative z-[1] h-3 w-3 rounded-full bg-foreground/80 group-hover:scale-110 transition-transform" />
              </button>
            </div>
           <FloatingBuildAssistant />
          </TooltipProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
