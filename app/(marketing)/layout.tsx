"use client";

import Navbar  from "./_components/navbar";
import { SiriGlow } from "@/components/siri-glow";

const MarketingLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="h-full dark:bg-[#1F1F1F]">
      <SiriGlow />
      <Navbar />
      <main className="h-full pt-40">
        {children}
      </main>
    </div>
   );
}
 
export default MarketingLayout;