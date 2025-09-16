"use client";

import "./globals.css";
import { Suspense } from "react";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/app/(marketing)/_components/navbar";

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ConvexClientProvider>
            <Navbar />

            {/* Page content */}
            <Suspense fallback={null}>{children}</Suspense>

            {/* Global toaster */}
            <Toaster richColors />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
