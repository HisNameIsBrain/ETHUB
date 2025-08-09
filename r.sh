#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="ETHUB"
mkdir -p "$ROOT/lib" "$ROOT/components"

# --- lib/auth.ts: add a safe signOut shim for client usage ---
cat > "$ROOT/lib/auth.ts" <<'TS'
// Clerk server helpers
export { auth, currentUser } from "@clerk/nextjs/server";

// Client signOut shim (so existing imports keep working)
export const signOut = async () => {
  if (typeof window !== "undefined") {
    const mod = await import("@clerk/nextjs");
    if (typeof mod.signOut === "function") {
      await mod.signOut();
      return;
    }
    // Fallback if signOut isn't exported: use the hook dynamically
    const { useClerk } = mod as any;
    try {
      const { signOut: hookSignOut } = useClerk?.() || {};
      if (hookSignOut) await hookSignOut();
    } catch {}
  }
};
TS

# --- lib/db.ts: provide a minimal getProducts stub to unblock build ---
cat > "$ROOT/lib/db.ts" <<'TS'
export type Product = { id: string; name: string; price?: number };

// Placeholder; replace with Convex query in the future.
export async function getProducts(): Promise<Product[]> {
  return [];
}

const db: any = {};
export default db;
export { db };
TS

# --- components/textarea.tsx: replace with known-good shadcn/ui implementation ---
mkdir -p "$ROOT/components"
cat > "$ROOT/components/textarea.tsx" <<'TS'
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2",
          "text-sm ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
TS

echo "Patched lib/auth.ts, lib/"
