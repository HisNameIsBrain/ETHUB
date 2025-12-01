"use client";

import { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import AssistantLauncher from "@/components/assistant-launcher";
import { SearchCommand } from "@/components/search-command";
import { Navigation } from "@/app/(app)/_components/navigation"; // documents navbar already themed
import { EnsureUser } from "@/components/ensure-user";
import { Spinner } from "@/components/spinner";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const pathname = usePathname();
  const router = useRouter();

  const publicPrefixes = ["/portal", "/mc", "/pc", "/todo"];
  const isPublicRoute = pathname
    ? publicPrefixes.some((prefix) => pathname.startsWith(prefix))
    : false;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) router.push("/");
  }, [isLoading, isAuthenticated, isPublicRoute, router]);

  if (!isPublicRoute) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      );
    }

    if (!isAuthenticated) return null;
  }

  return (
    <>
      {isAuthenticated && <EnsureUser />}
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
