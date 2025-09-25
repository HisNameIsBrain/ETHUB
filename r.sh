#!/usr/bin/env bash
set -euo pipefail

echo "== ETHUB Convex/TypeScript Doctor =="

# 0) Sanity: ensure Convex is installed
if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found. Install Node/npm first."
  exit 1
fi

# 1) Quick typo fix: v.strings() -> v.string()
if [[ -f convex/schema.ts ]]; then
  if grep -n "v\.strings()" convex/schema.ts >/dev/null 2>&1; then
    echo "Fixing typo in convex/schema.ts: v.strings() -> v.string()"
    sed -i.bak 's/v\.strings()/v.string()/g' convex/schema.ts
  fi
fi

# 2) Show the indexes your code CALLS
echo
echo "-- Indexes REFERENCED in code (withIndex/withSearchIndex) --"
rg -n --no-heading 'with(Index|SearchIndex)\(' convex | sed 's/^/  /' || true

# 3) Show the indexes your schema DEFINES
echo
echo "-- Indexes DEFINED in convex/schema.ts --"
rg -n --no-heading '\.index\(|\.searchIndex\(' convex/schema.ts | sed 's/^/  /' || true

# 4) Try regenerate + typecheck
echo
echo "== Running convex codegen =="
set +e
npx convex codegen
cc=$?
set -e
if [[ $cc -ne 0 ]]; then
  echo
  echo "convex codegen reported errors. See above."
fi

echo
echo "== Running tsc =="
set +e
npx tsc -p .
ts=$?
set -e

if [[ $ts -ne 0 ]]; then
  echo
  echo "== tsc failed. High-signal hints =="
  # 4a) Call out missing api.services.fetch (common)
  if ! rg -n 'export const fetch = query\(' convex/services.ts >/dev/null 2>&1; then
    echo "• Your code references api.services.fetch but it's not exported from convex/services.ts."
    echo "  - Either add the 'fetch' query export, or change callers to use getPublic."
  fi

  # 4b) Check for index mismatches on services
  if rg -n 'services\).*withIndex\("by_createdAt"' convex >/dev/null 2>&1; then
    if ! rg -n '\.index\("by_createdAt"' convex/schema.ts >/dev/null 2>&1; then
      echo "• Code uses services.by_createdAt but schema doesn't define it. Add:"
      echo '    .index("by_createdAt", ["createdAt"])'
    fi
  fi

  if rg -n 'services\).*withIndex\("by_isPublic"' convex >/dev/null 2>&1; then
    if ! rg -n '\.index\("by_isPublic"' convex/schema.ts >/dev/null 2>&1; then
      echo "• Code uses services.by_isPublic but schema doesn't define it. Add:"
      echo '    .index("by_isPublic", ["isPublic"])'
    fi
  fi

  if rg -n 'services\).*withIndex\("by_slug"' convex >/dev/null 2>&1; then
    if ! rg -n '\.index\("by_slug"' convex/schema.ts >/dev/null 2>&1; then
      echo "• Code uses services.by_slug but schema doesn't define it. Add:"
      echo '    .index("by_slug", ["slug"])'
    fi
  fi

  # 4c) Check for user indexes used by ensure_user* files
  if rg -n 'users\).*withIndex\("by_userId"' convex >/dev/null 2>&1; then
    if ! rg -n '\.index\("by_userId"' convex/schema.ts >/dev/null 2>&1; then
      echo "• Code uses users.by_userId but schema doesn't define it. Add:"
      echo '    .index("by_userId", ["userId"])'
    fi
  fi
  if rg -n 'users\).*withIndex\("by_token"' convex >/dev/null 2>&1; then
    if ! rg -n '\.index\("by_token"' convex/schema.ts >/dev/null 2>&1; then
      echo "• Code uses users.by_token but schema doesn't define it. Add:"
      echo '    .index("by_token", ["tokenIdentifier"])'
    fi
  fi

  echo
  echo "Open the errors above, fix or paste the schema snippet I gave you below, then re-run:"
  echo "  ./r.sh"
  exit $ts
fi

echo
echo "✅ TypeScript is happy. If your app still complains at runtime, re-run: npx convex dev"
