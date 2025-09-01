#!/usr/bin/env bash
set -euo pipefail

echo "== ensure scripts are executable =="
chmod +x scripts/codemods/*.js || true

echo "== patch next.config.js typedRoutes =="
node scripts/codemods/patch-next-config.js

echo "== add utils/safeParse.ts =="
mkdir -p utils
cat > utils/safeParse.ts <<'TS'
export function safeJsonParse<T = unknown>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}
TS

echo "== add components/SiriBubbleButton.tsx (client-only) =="
mkdir -p components
cat > components/SiriBubbleButton.tsx <<'TSX'
"use client";
export default function SiriBubbleButton({ onOpenEventName = "siri-bubble:open" }: { onOpenEventName?: string }) {
  return (
    <button
      aria-label="Open assistant"
      data-open-assistant-trigger
      className="group relative grid h-14 w-14 place-items-center rounded-full border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-lg hover:shadow-xl transition-all"
      onClick={() => {
        const evt = new CustomEvent(onOpenEventName);
        window.dispatchEvent(evt);
      }}
    >
      <div className="relative z-[1] h-3 w-3 rounded-full bg-foreground/80 group-hover:scale-110 transition-transform" />
    </button>
  );
}
TSX

echo "== run codemods =="
node scripts/codemods/fix-typed-routes.js
node scripts/codemods/remove-invalid-editor-props.js
node scripts/codemods/ensure-client-where-events.js
node scripts/codemods/escape-jsx-quotes.js || true

echo "== convex codegen =="
npx convex codegen || true

echo "== eslint/prettier/tsc/build =="
npx eslint . --ext .ts,.tsx --fix || true
npx prettier . --write || true
npx tsc -p tsconfig.json --noEmit
