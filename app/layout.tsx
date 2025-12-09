// app/layout.tsx
import "./globals.css";
import { Suspense } from "react";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { MainNavbar } from "@/components/dashboard/main-navbar";
import { Toaster } from "@/components/ui/sonner";
import { SiriFlow } from "@/components/siri-flow";
import { IntroSplash } from "@/components/intro-splash";
import { ThemeProvider } from "./providers";

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background text-foreground antialiased">
          <ThemeProvider>
            <ConvexClientProvider>
              <IntroSplash />
              <SiriFlow />
              <MainNavbar />

              <Suspense fallback={null}>{children}</Suspense>
              <Toaster richColors />
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
  );
}
