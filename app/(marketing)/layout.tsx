"use client";

import { ClerkProvider } from "@clerk/nextjs"; // or "@clerk/nextjs/app-beta" if using App Router
import { Navbar } from "./_components/navbar";
import { SiriGlow } from "@/components/siri-glow";

const MarketingLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <ClerkProvider>
      <div className="h-full dark:bg-[#1F1F1F]">
        <SiriGlow />
        <Navbar />
        <main className="h-full pt-40">
          {children}
        </main>
      </div>
    </ClerkProvider>
  );
};

export default MarketingLayout;