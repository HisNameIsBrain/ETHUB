"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { Spinner } from "@/components/spinner";
import { SiriGlow } from "@/components/siri-glow";
import { Navigation } from "./_components/navigation";
import { SearchCommand } from "@/components/search-command";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-black">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    redirect("/documents");
  }

  return (
    <div className="h-screen w-full flex flex-col dark:bg-[#1F1F1F]">
      <Navigation />
      <main className="flex-1 overflow-y-auto p-6">
        <SearchCommand />
        {children}
      </main>
    </div>
  );
}
