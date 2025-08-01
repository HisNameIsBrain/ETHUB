"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProviderWithAuth } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMemo } from "react";

import { useConvexAuth } from "convex/react";
import { redirect, usePathname } from "next/navigation";
import { Spinner } from "@/components/spinner";
import { Navigation } from "./_components/navigation";
import { SearchCommand } from "@/components/search-command";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-black">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated && pathname !== "/documents") {
    redirect("/documents");
  }

  return (
    <ClerkProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useConvexAuth}>
        <div className="h-screen w-full flex flex-col dark:bg-[#1F1F1F]">
          <Navigation />
          <main className="flex-1 overflow-y-auto p-6">
            <SearchCommand />
            {children}
          </main>
        </div>
      </ConvexProviderWithAuth>
    </ClerkProvider>
  );
}