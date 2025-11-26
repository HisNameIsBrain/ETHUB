"use client";

import { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import AssistantLauncher from "@/components/assistant-launcher";
import { SearchCommand } from "@/components/search-command";
import { Navigation } from "@/app/(main)/_components/navigation"; // documents navbar already themed
import { EnsureUser } from "@/components/ensure-user";
import { Spinner } from "@/components/spinner";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <EnsureUser />
      <AssistantLauncher />

      {/* App frame */}
      <div className="min-h-screen w-full bg-background text-foreground">
        {/* Your left Navigation renders separately (sidebar + TopNav via navbarRef) */}
        <div className="flex w-full h-screen">
          {children}
        </div>
      </div>
    </>
  );
}
