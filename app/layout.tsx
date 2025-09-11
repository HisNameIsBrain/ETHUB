"use client";

import "./globals.css";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";

import ClientSEO from "@/components/client-seo";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/app/(marketing)/_components/navbar";
import SiriGlow from "@/components/siri-glow";
import AssistantLauncher from "@/components/assistant-launcher";

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ClientSEO
          title="ETHUB"
          description="Tech Hub platform"
          metas={[
            { name: "theme-color", content: "#0f172a" },
            { property: "og:title", content: "ETHUB" },
            { property: "og:description", content: "Tech Hub platform" },
          ]}
        />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ConvexClientProvider>
            <TooltipProvider>
              <Navbar />

              <main className="min-h-[calc(100vh-4rem)]">
                <Suspense fallback={null}>{children}</Suspense>
              </main>

              <Toaster richColors />

	// app/layout.tsx (inside your floating assistant UI)
	<div className="fixed z-[...]" role="region" aria-label="Assistant launcher">

	   <AssistantLauncher />
	  {/* whatever inner glow/ring/icon you had */}

	      <div className="pointer-events-none">

	 </div>
	      </div>
            </TooltipProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
