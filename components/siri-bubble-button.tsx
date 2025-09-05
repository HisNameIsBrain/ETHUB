"use client";

import { ButtonHTMLAttributes } from "react";
import SiriGlowRim from "@/components/siri-glow-rim";
import { Bot } from "lucide-react"; // AI icon

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function SiriBubbleButton(props: Props) {
  return (
    <button
      {...props}
      className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-background/40 shadow-sm ring-1 ring-border backdrop-blur-md"
      aria-label={props["aria-label"] ?? "AI"}
    >
      {/* RIM GLOW */}
      <SiriGlowRim className="z-0" />

      {/* INNER CORE / ICON */}
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background/70 ring-1 ring-border/60">
        <Bot className="h-5 w-5 opacity-90" aria-hidden />
      </div>
    </button>
  );
}
