'use client';

import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminNavbar }  from "@/components/admin/admin-navbar";
import { SiriGlow } from "@/components/siri-glow";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Protect admin routes based on Clerk role
  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== "admin") {
      router.push("/unauthorized");
    }
  }, [isLoaded, user, router]);

  return (
    <><SignedIn>
          <div className="relative min-h-screen bg-white dark:bg-[#1f1f1f] text-black dark:text-white">
              <SiriGlow />
              <AdminNavbar />
              <main className="pt-20 px-4 max-w-6xl mx-auto">
                  {children}
              </main>
          </div>
      </SignedIn><SignedOut>
              <div className="min-h-screen flex items-center justify-center text-red-600">
                  Please sign in to access admin tools.
              </div>
          </SignedOut></>
  );
}
