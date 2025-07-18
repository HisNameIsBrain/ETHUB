"use client";

import { useConvexAuth } from "convex/react";
import { Spinner } from "@/components/spinner";
import { SearchCommand } from "@/components/search-command";
import { ServicesNavbar } from "@/components/services-navbar";
import { SiriGlow } from "@/components/siri-glow";

const ServicesLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="h-screen w-full flex flex-col dark:bg-[#1F1F1F]">
      <SiriGlow />
      <ServicesNavbar />
      <main className="flex-1 overflow-y-auto p-6">
        <SearchCommand />
        {children}
      </main>
    </div>
  );
};

export default ServicesLayout;