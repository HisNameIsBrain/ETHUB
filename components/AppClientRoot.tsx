// components/AppClientRoot.tsx  (CLIENT)
"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";

import IntroSplash2D from "@/components/IntroSplash2D";
import AssistantLauncher from "@/components/assistant-launcher";
import { MainNavbar } from "@/components/dashboard/main-navbar";
import { SiriFlow } from "@/components/siri-flow";


export default function AppClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="relative min-h-dvh">
        {/* Fullscreen intro overlay */}
        <AnimatePresence mode="wait">
          <IntroSplash2D />
        </AnimatePresence>

        {/* Optional inverted overlay (if you want a global invert mode) */}
        {/* Global UI */}
        <SiriFlow />
        <MainNavbar />
        <AssistantLauncher />

        {/* Route content */}
        <div className="relative">{children}</div>
      </div>
    </ThemeProvider>
  );
}
