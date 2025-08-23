#!/usr/bin/env bash
set -euo pipefail

FILE="convex/documents.ts"

if [[ ! -f "$FILE" ]]; then
  echo "❌ $FILE not found. Run this from your project root."
  exit 1
fi

echo "🔧 Backing up $FILE -> ${FILE}.bak"
cp "$FILE" "${FILE}.bak"

echo "🔁 Replacing .withIndex(\"by_userId\", ...) -> .withIndex(\"by_user\", ...)"
# Replace all occurrences safely (handles spaces/newlines)
perl -0777 -pe 's/\.withIndex\(\s*"by_userId"\s*,/\.withIndex("by_user",/g' "${FILE}.bak" > "$FILE"

echo "✅ Replacement done."
echo

# Optional: gentle check that schema likely has the needed index
SCHEMA="convex/schema.ts"
if [[ -f "$SCHEMA" ]]; then
  if grep -qE '\.index\(\s*"by_user"\s*,\s*\[\s*"userId"\s*\]\s*\)' "$SCHEMA"; then
    echo "📄 Schema check: found index by_user on userId in $SCHEMA"
  else
    echo "⚠️  Schema check: could not find '.index(\"by_user\", [\"userId\"])' in $SCHEMA"
    echo "    If you see query perf/type errors, add this to your documents table indexes:"
    echo '      .index("by_user", ["userId"])'
  fi
else
  echo "ℹ️  $SCHEMA not found; skipping schema check."
fi

# Run codegen and typecheck with whatever you use (pnpm/npm/yarn)
RUNNER=""
if command -v pnpm >/dev/null 2>&1; then
  RUNNER="pnpm"
elif command -v npm >/dev/null 2>&1; then
  RUNNER="npm run"
elif command -v yarn >/dev/null 2>&1; then
  RUNNER="yarn"
fi

if [[ -n "$RUNNER" ]]; then
  echo
  echo "🚀 Running convex codegen + typecheck..."
  if [[ "$RUNNER" == "pnpm" ]]; then
    pnpm convex codegen || true
    pnpm typecheck || true
  elif [[ "$RUNNER" == "npm run" ]]; then
    npm run convex:codegen || true
    npm run typecheck || true
  else
    yarn convex codegen || true
    yarn typecheck || true
  fi
  echo "✅ Done. Review any remaining errors above."
else
  echo
  echo "⚠️  pnpm/npm/yarn not found. Skipping codegen/typecheck."
  echo "    Manually run your codegen/typecheck after this."
fi
