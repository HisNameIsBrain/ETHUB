"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

export interface SiriBubbleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SiriBubbleButton = React.forwardRef<
  HTMLButtonElement,
  SiriBubbleButtonProps
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-background/40 shadow-sm ring-1 ring-border backdrop-blur-md",
      "overflow-hidden transition hover:scale-105 hover:shadow-lg",
      className
    )}
    {...props}
  >
    {/* Siri Glow (animated gradient) */}
    <div
      className="absolute inset-0 rounded-full blur-xl opacity-70 animate-siriGlow"
      style={{
        background:
          "conic-gradient(from 0deg, #ff0080, #7928ca, #2afadf, #ff0080)",
      }}
    />

    {/* Solid circle overlay for clarity */}
    <div className="absolute inset-[2px] rounded-full bg-background/60 backdrop-blur-sm" />

    {/* Icon on top */}
    <Bot className="relative z-10 h-6 w-6 text-foreground" />
  </button>
));
SiriBubbleButton.displayName = "SiriBubbleButton";
