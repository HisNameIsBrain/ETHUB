#!/usr/bin/env bash
set -euo pipefail

# Normalize line endings if this file got saved with CRLF
# (safe no-op on LF files)
if command -v sed >/dev/null 2>&1; then
  sed -i 's/\r$//' "$0" || true
fi

echo "🔧 ETHUB repair starting…"

# --- helpers ---
backup_file() {
  local f="$1"
  if [ -f "$f" ]; then
    cp "$f" "$f.bak.$(date +%s)"
    echo "🧷 Backed up $f -> $f.bak.*"
  fi
}

ensure_dir() {
  mkdir -p "$1"
}

# --- 0) sanity checks ---
if [ ! -d "app" ]; then
  echo "❌ This doesn't look like a Next.js app dir (missing ./app). Run from repo root."
  exit 1
fi

# --- 1) Fix duplicate /sign-in and /sign-up conflicts ---
echo "🧹 Cleaning duplicate auth routes…"
FOUND_SIGNIN="$(find app -type f -path "*/sign-in/page.tsx" 2>/dev/null || true)"
if [ -n "${FOUND_SIGNIN}" ]; then
  echo "🗑 Removing:"
  echo "${FOUND_SIGNIN}"
  find app -type f -path "*/sign-in/page.tsx" -delete
fi

FOUND_SIGNUP="$(find app -type f -path "*/sign-up/page.tsx" 2>/dev/null || true)"
if [ -n "${FOUND_SIGNUP}" ]; then
  echo "🗑 Removing:"
  echo "${FOUND_SIGNUP}"
  find app -type f -path "*/sign-up/page.tsx" -delete
fi

# Ensure exactly one catch-all route for each
ensure_dir "app/(auth)/sign-in/[[...rest]]"
if [ ! -f "app/(auth)/sign-in/[[...rest]]/page.tsx" ]; then
  cat <<'TSX' > "app/(auth)/sign-in/[[...rest]]/page.tsx"
"use client";
import { SignIn } from "@clerk/nextjs";
export default function Page() {
  return <SignIn routing="path" />;
}
TSX
  echo "➕ Created app/(auth)/sign-in/[[...rest]]/page.tsx"
else
  echo "✅ Catch-all sign-in exists."
fi

ensure_dir "app/(auth)/sign-up/[[...rest]]"
if [ ! -f "app/(auth)/sign-up/[[...rest]]/page.tsx" ]; then
  cat <<'TSX' > "app/(auth)/sign-up/[[...rest]]/page.tsx"
"use client";
import { SignUp } from "@clerk/nextjs";
export default function Page() {
  return <SignUp routing="path" />;
}
TSX
  echo "➕ Created app/(auth)/sign-up/[[...rest]]/page.tsx"
else
  echo "✅ Catch-all sign-up exists."
fi

# --- 2) Replace middleware.ts with a clean version (resolves merge markers) ---
echo "🧹 Rewriting middleware.ts (clean, merge-free)…"
backup_file "middleware.ts"
cat <<'TS' > "middleware.ts"
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/services",
  "/services/:path*",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback",
  "/api/public/:path*",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/_next/:path*",
  "/images/:path*",
  "/icons/:path*",
  "/public/:path*",
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return;
  const { userId, redirectToSignIn } = auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: req.url });
});

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|txt|xml|css|js|map|mp4|mp3)).*)",
    "/",
  ],
};
TS
echo "✅ middleware.ts replaced."

# --- 3) Ensure global Providers (Clerk + Convex) and wire into app/layout.tsx ---
echo "🧱 Ensuring Providers (Clerk + Convex)…"
ensure_dir "app"
backup_file "app/providers.tsx"
cat <<'TSX' > "app/providers.tsx"
"use client";
import * as React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    </ClerkProvider>
  );
}
TSX
echo "✅ app/providers.tsx written."

# If layout exists, replace with a safe minimal root that uses Providers. Backup first.
LAYOUT="app/layout.tsx"
if [ -f "$LAYOUT" ]; then
  echo "🧷 Backing up and rewriting app/layout.tsx to include Providers…"
  backup_file "$LAYOUT"
fi

cat <<'TSX' > "$LAYOUT"
"use client";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
TSX
echo "✅ app/layout.tsx now wraps everything with Providers."

# --- 4) Add an explicit OAuth callback page (optional but robust) ---
ensure_dir "app/sso-callback"
if [ ! -f "app/sso-callback/page.tsx" ]; then
  cat <<'TSX' > "app/sso-callback/page.tsx"
"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SsoCallback() {
  return <AuthenticateWithRedirectCallback />;
}
TSX
  echo "➕ Created app/sso-callback/page.tsx"
fi

# --- 5) Find likely missing-key sites; optional auto-fix with FIX_KEYS=1 ---
echo "🔎 Scanning for likely missing React keys…"
SUSPECTS=()
while IFS= read -r line; do
  SUSPECTS+=("$line")
done < <(grep -RIn --include='*.{tsx,jsx,ts,js}' '\.map\s*\(' app components 2>/dev/null || true)

if [ ${#SUSPECTS[@]} -eq 0 ]; then
  echo "✅ No obvious .map( ) sites found (still keep an eye on checkout/line-item UIs)."
else
  echo "⚠️  Potential .map( ) sites (check they set key=… on the returned JSX):"
  printf '   %s\n' "${SUSPECTS[@]}"
  echo "ℹ️  If you want a *basic* auto-fix adding key={i} for very simple cases, re-run with:"
  echo "    FIX_KEYS=1 bash $0"
  if [ "${FIX_KEYS:-0}" = "1" ]; then
    echo "🛠 Attempting naive auto-fix for simple patterns (backup .bak.* files will be created)…"
    for f in $(printf '%s\n' "${SUSPECTS[@]}" | cut -d: -f1 | sort -u); do
      backup_file "$f"
      perl -0777 -i -pe '
        s/\.map\s*\(\s*\(\s*([a-zA-Z_$][\w$]*)\s*\)\s*=>\s*\(\s*<([A-Za-z][\w:]*)\b(?![^>]*\bkey=)/.map(($1, i) => (<$2 key={i}/gs;
        s/\.map\s*\(\s*([a-zA-Z_$][\w$]*)\s*\)\s*=>\s*<([A-Za-z][\w:]*)\b(?![^>]*\bkey=)/.map(($1, i) => <$2 key={i}/gs;
      ' "$f" || true
    done
    echo "✅ Auto-fix pass complete (heuristic). Please review git diff."
  fi
fi

# --- 6) Gentle env reminder ---
if [ -z "${NEXT_PUBLIC_CONVEX_URL:-}" ]; then
  echo "⚠️  NEXT_PUBLIC_CONVEX_URL is not set in your environment. ConvexProvider needs it."
  echo "    Add to .env.local, e.g.:"
  echo "    NEXT_PUBLIC_CONVEX_URL=https://graceful-camel-887.convex.site"
fi

echo "🎉 Repair script finished."
echo "👉 Now: stop & restart your dev server."
