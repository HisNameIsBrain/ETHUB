// app/admin/layout.tsx
"use client";

import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
    );
}