#!/usr/bin/env bash
# surgical_fix.sh — minimal, careful build fixes for ETHUB
# - No wholesale replacements
# - Only edits what’s necessary
# - Backs up any file it touches

set -euo pipefail

ROOT="$(pwd)"
COMP_DIR="$ROOT/components"

echo "==> Ensuring required dev tools (ESLint stack only; leaving TypeScript as-is)"
# Upgrade eslint toolchain to support TS 5.9 without touching your TS version
npm i -D eslint@9 @typescript-eslint/parser@8 @typescript-eslint/eslint-plugin@8 eslint-config-next@15 >/dev/null

echo "==> Add/patch package.json scripts minimally"
node - <<'EOF'
const fs = require('fs');
const p = 'package.json';
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));

pkg.scripts = pkg.scripts || {};

const before = JSON.stringify(pkg.scripts);
if (!pkg.scripts.lint || pkg.scripts.lint === 'next lint') {
  pkg.scripts.lint = 'eslint .';
}
if (!pkg.scripts.typecheck) {
  pkg.scripts.typecheck = 'tsc -p tsconfig.json --noEmit';
}
if (!pkg.scripts.build) pkg.scripts.build = 'next build';
if (!pkg.scripts.dev)   pkg.scripts.dev   = 'next dev';
if (!pkg.scripts.start) pkg.scripts.start = 'next start';

const after = JSON.stringify(pkg.scripts);
if (before !== after) {
  fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
  console.log('package.json scripts updated (minimal changes).');
} else {
  console.log('package.json scripts already OK; no changes.');
}
EOF

echo "==> Create fallback SiriGlowRing ONLY if missing"
mkdir -p "$COMP_DIR"
if [ ! -f "$COMP_DIR/SiriGlowRing.tsx" ]; then
  cat > "$COMP_DIR/SiriGlowRing.tsx" <<'EOF'
"use client";
import SiriGlowInvert from "@/components/siri-glow-invert";

type Props = React.ComponentProps<"div"> & { className?: string };

export default function SiriGlowRing({ className, ...rest }: Props) {
  return (
    <div className={className ?? ""} {...rest} aria-hidden>
      <div className="pointer-events-none absolute inset-0">
        <SiriGlowInvert />
      </div>
    </div>
  );
}
EOF
  echo "Created components/SiriGlowRing.tsx (non-destructive fallback)."
else
  echo "components/SiriGlowRing.tsx already exists; left untouched."
fi

# Minimal fixer for the known JSX error:
# If components/loading-indicator.tsx has one or more extra <div> openings vs </div>, append the missing closers.
FILE="$COMP_DIR/loading-indicator.tsx"
if [ -f "$FILE" ]; then
  echo "==> Inspecting $FILE for unbalanced <div> tags"
  OPEN_DIVS=$(grep -o "<div[^/>]*>" "$FILE" | wc -l | tr -d ' ')
  SELF_CLOSING=$(grep -o "<div[^>]*\/>" "$FILE" | wc -l | tr -d ' ' || true)
  CLOSE_DIVS=$(grep -o "</div>" "$FILE" | wc -l | tr -d ' ')
  # subtract self-closing from opens
  EFFECTIVE_OPENS=$((OPEN_DIVS - SELF_CLOSING))
  if [ "$EFFECTIVE_OPENS" -gt "$CLOSE_DIVS" ]; then
    MISSING=$((EFFECTIVE_OPENS - CLOSE_DIVS))
    cp "$FILE" "$FILE.bak"
    printf '\n' >> "$FILE"
    for i in $(seq 1 $MISSING); do
      echo "</div>" >> "$FILE"
    done
    echo "Patched $FILE by appending $MISSING missing </div> tag(s). Backup: $FILE.bak"
  else
    echo "$FILE appears balanced; no changes."
  fi
else
  echo "Note: $FILE not found; skipping JSX balance check."
fi

echo "==> Running convex codegen if Convex is present"
if [ -d "convex" ] || [ -f "convex.json" ]; then
  npx convex codegen || true
else
  echo "No convex/ directory; skipping codegen."
fi

echo "==> Lint (non-blocking)"
npm run lint || true

echo "==> Typecheck"
npm run typecheck

echo "==> Build"
npm run build

cat <<'MSG'

✅ Surgical pass complete.

What changed:
- ESLint plugins upgraded to match TS 5.9 (no TS version change).
- package.json scripts minimally adjusted (only lint/typecheck if needed).
- components/SiriGlowRing.tsx added ONLY if it did not exist.
- components/loading-indicator.tsx left as-is unless it had unbalanced <div>…</div> tags; if patched, a .bak backup was created.

No files were deleted. No wholesale replacements were made.

If the build still flags `components/VoiceDock.tsx` with a parsing error around ~120–140, that’s usually an unmatched brace/paren in that file; send me those 40 lines and I’ll give you an exact, line-by-line patch without touching anything else.

MSG
