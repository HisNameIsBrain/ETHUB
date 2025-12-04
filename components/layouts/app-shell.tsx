"use client";

import { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import AssistantLauncher from "@/components/assistant-launcher";
import { EnsureUser } from "@/components/ensure-user";
import { Spinner } from "@/components/spinner";

const publicPrefixes = ["/portal", "/mc", "/pc", "/todo"];

export function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const pathname = usePathname();
  const router = useRouter();

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

      <div className="min-h-screen w-full bg-background text-foreground">
        <div className="flex w-full h-screen">{children}</div>
      </div>
    </>
  );
}
