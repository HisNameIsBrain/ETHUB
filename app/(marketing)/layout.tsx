
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/app/(marketing)/_components/navbar";
import { SiriGlow } from "@/components/siri-glow";
import { SiriGlowInvert } from "@/components/siri-glow-invert";
import React from "react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="h-full dark:bg-[#1F1F1F]">
        <Navbar />
        <SiriGlow />
        <SiriGlowInvert />
        <main className="h-full pt-40">{children}</main>
      </div>
  );
}