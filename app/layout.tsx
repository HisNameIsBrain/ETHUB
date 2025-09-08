"use client";

import "./globals.css";
import { Suspense } from "react";

// Client-side SEO helper (titles/meta after hydration)
import ClientSEO from "@/components/client-seo";

// Providers & UI
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// App chrome
import { Navbar } from "@/app/(marketing)/_components/navbar";

// Siri-style bubble (animated ring)
import { SiriGlow } from "@/components/siri-glow";
import {SiriFlow} from "@/components/siri-flow";
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

            {/* Page content */}
            <main className="min-h-[calc(100vh-4rem)]">
              <Suspense fallback={null}>{children}</Suspense>
            </main>

            {/* Global toaster */}
            <Toaster richColors />
	    {/* AI */}
            <div
	      id="ai-bubble"
              className="
                fixed z-[1000]
                right-[calc(env(safe-area-inset-right)+1.5rem)]
                bottom-[calc(env(safe-area-inset-bottom)+1.5rem)]
                flex items-center gap-3
              "
            >
              <span className="sr-only">Open assistant</span>
              <button
                aria-label="Open assistant"
                className="group relative grid h-14 w-14 place-items-center rounded-full border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-lg hover:shadow-xl transition-all"
                onClick={() => window.dispatchEvent(new CustomEvent("siri-bubble:open"))}
              >
                <div className="pointer-events-none absolute inset-0">
                  <SiriGlow />
		  <SiriFlow />
                </div>
                <div className="relative z-[1] h-3 w-3 rounded-full bg-foreground/80 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </TooltipProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
