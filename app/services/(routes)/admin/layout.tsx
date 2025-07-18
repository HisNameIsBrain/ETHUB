"use client";

import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useState } from "react";

import { AdminNavbar } from "@/components/admin-navbar"; // adjust path if needed

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <ClerkProvider>
      <SignedIn>
        <div className="h-screen w-full flex flex-col bg-white dark:bg-[#1F1F1F]">
          <AdminNavbar
            isCollapsed={isCollapsed}
            onResetWidth={() => setIsCollapsed(false)}
          />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  );
}