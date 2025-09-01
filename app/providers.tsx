"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
