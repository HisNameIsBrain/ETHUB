"use client";

import "./globals.css";
import { Suspense } from "react";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/app/(marketing)/_components/navbar";
//import AssistantLauncher from "@/components/assistant-launcher";
import { SiriFlow } from "@/components/siri-flow";

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ConvexClientProvider>
            <Navbar />
		<SiriFlow />
            <Suspense fallback={null}>{children}</Suspense>

            {/* Global toaster */}
            <Toaster richColors />
       </ConvexClientProvider>
      </body>
    </html>
  );
}

	
	
