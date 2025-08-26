"use client";

import * as React from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner"; // or your toaster path
import { EdgeStoreProvider } from "@/lib/edgestore/provider"; // adjust path

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <EdgeStoreProvider>
            <TooltipProvider delayDuration={150}>
              {children}
              <Toaster richColors closeButton position="top-right" />
            </TooltipProvider>
          </EdgeStoreProvider>
        </ConvexProviderWithClerk>
      </ThemeProvider>
    </ClerkProvider>
  );
}
