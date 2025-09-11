"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SiriBubbleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SiriBubbleButton = React.forwardRef<
  HTMLButtonElement,
  SiriBubbleButtonProps
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-background/40 shadow-sm ring-1 ring-border backdrop-blur-md transition",
      "hover:scale-105 hover:shadow-lg",
      className
    )}
    {...props}
  />
));

SiriBubbleButton.displayName = "SiriBubbleButton";
