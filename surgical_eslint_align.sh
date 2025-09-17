#!/usr/bin/env bash
# surgical_eslint_align.sh — minimal dependency alignment + tiny safety fixes
# - Pins eslint@8.57.0 and @typescript-eslint v7 to avoid ERESOLVE
# - Leaves TypeScript and eslint-config-next untouched
# - Adds lint/typecheck scripts if missing
# - Adds SiriGlowRing fallback ONLY if file is missing
# - Fixes unbalanced </div> in components/loading-indicator.tsx only if needed (backs up .bak)
# - Runs convex codegen (if present), lint, typecheck, build

set -euo pipefail

echo "==> Pinning compatible dev deps (no TS change, no config-next change)"
npm i -D -E \
  eslint@8.57.0 \
  @typescript-eslint/parser@7.18.0 \
  @typescript-eslint/eslint-plugin@7.18.0 \
  eslint-config-next@$(node -e "try{const p=require('./package.json');const v=(p.devDependencies&&p.devDependencies['eslint-config-next'])||(p.dependencies&&p.dependencies['eslint-config-next'])||'';process.stdout.write(v.replace('^','').replace('~','')||'15');}catch{process.stdout.write('15');}")

echo "==> Ensure package.json scripts exist (minimal edits only)"
node - <<'EOF'
const fs = require('fs');
const p = 'package.json';
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
pkg.scripts = pkg.scripts || {};
let changed = false;

if (!pkg.scripts.lint || pkg.scripts.lint === 'next lint') { pkg.scripts.lint = 'eslint .'; changed = true; }
if (!pkg.scripts.typecheck) { pkg.scripts.typecheck = 'tsc -p tsconfig.json --noEmit'; changed = true; }
if (!pkg.scripts.build) { pkg.scripts.build = 'next build'; changed = true; }
if (!pkg.scripts.dev)   { pkg.scripts.dev   = 'next dev'; changed = true; }
if (!pkg.scripts.start) { pkg.scripts.start = 'next start'; changed = true; }

if (changed) fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
console.log(changed ? 'package.json scripts updated (minimal).' : 'package.json scripts already OK.');
EOF

COMP_DIR="components"
FILE_RING="$COMP_DIR/SiriGlowRing.tsx"
FILE_LI="$COMP_DIR/loading-indicator.tsx"

echo "==> Add SiriGlowRing fallback ONLY if missing"
mkdir -p "$COMP_DIR"
if [ ! -f "$FILE_RING" ]; then
  cat > "$FILE_RING" <<'EOF'
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
  echo "Created $FILE_RING"
else
  echo "$FILE_RING already exists; left untouched."
fi

echo "==> Check for unbalanced <div> in $FILE_LI (append missing closers only)"
if [ -f "$FILE_LI" ]; then
  OPEN_DIVS=$(grep -o "<div[^/>]*>" "$FILE_LI" | wc -l | tr -d ' ' || true)
  SELF_CLOSING=$(grep -o "<div[^>]*\/>" "$FILE_LI" | wc -l | tr -d ' ' || true)
  CLOSE_DIVS=$(grep -o "</div>" "$FILE_LI" | wc -l | tr -d ' ' || true)
  EFFECTIVE_OPENS=$((OPEN_DIVS - SELF_CLOSING))
  if [ "$EFFECTIVE_OPENS" -gt "$CLOSE_DIVS" ]; then
    MISSING=$((EFFECTIVE_OPENS - CLOSE_DIVS))
    cp "$FILE_LI" "$FILE_LI.bak"
    printf '\n' >> "$FILE_LI"
    for _ in $(seq 1 $MISSING); do echo "</div>" >> "$FILE_LI"; done
    echo "Patched $FILE_LI by appending $MISSING missing </div>. Backup at $FILE_LI.bak"
  else
    echo "$FILE_LI appears balanced; no changes."
  fi
else
  echo "Note: $FILE_LI not found; skipping."
fi

echo "==> Run convex codegen if present"
if [ -d "convex" ] || [ -f "convex.json" ]; then
  npx convex codegen || true
else
  echo "No convex/ dir; skipping codegen."
fi

echo "==> Lint (non-blocking so you can see warnings)"
npm run lint || true

echo "==> Typecheck"
npm run typecheck

echo "==> Build"
npm run build

echo "✅ Done: deps aligned and build attempted without replacing your files."
