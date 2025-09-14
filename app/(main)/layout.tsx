"use client";

import { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import AssistantLauncher from "@/components/assistant-launcher";
import SiriGlowRing from "@/components/siri-glow";
import SiriGlowRingInvert from "@/components/siri-glow-invert";
import { SearchCommand } from "@/components/search-command";
import { Navigation } from "./_components/navigation";
import { EnsureUser } from "@/components/ensure-user";
import { Spinner } from "@/components/spinner";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <EnsureUser />
      <AssistantLauncher />
      <div className="min-h-screen h-full flex dark:bg-[#1F1F1F]">
        <SiriGlow position="top" />
        <SiriGlowInvert position="bottom" />
        <Navigation />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 border-b bg-background/60 backdrop-blur">
            <div className="flex h-14 items-center gap-3 px-4">
              <SearchCommand />
              <h1 className="text-sm font-semibold tracking-tight">Dashboard</h1>
            </div>
          </header>
          <main className="flex-1 px-4 py-6">
            {children}
          </main>
          <footer className="border-t px-4 py-6 text-xs opacity-70">
            © {new Date().getFullYear()} ETHUB • All rights reserved
          </footer>
        </div>
      </div>
    </>
  );
}
