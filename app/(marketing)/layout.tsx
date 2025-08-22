import Providers from "@/app/providers";              // ✅ matches app/providers.tsx
import { Navbar } from "@/app/(marketing)/_components/navbar";
import { SiriGlow } from "@/components/siri-glow";
import React from "react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="h-full dark:bg-[#1F1F1F]">
        <Navbar />
        <SiriGlow />
        <main className="h-full pt-40">{children}</main>
      </div>
    </Providers>
  );
}
