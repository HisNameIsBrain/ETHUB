#!/usr/bin/env bash
set -euo pipefail

# 1) Show conflicts
echo "Conflicts:"
git diff --name-only --diff-filter=U || true
echo

# 2) Prefer YOUR current branch (fix/build-from-ca03bb6f) for core fixes we just added
keep_ours=(
  "convex/schema.ts"
  "convex/services.ts"
  "convex/backfill_documents.ts"
  "convex/backfill_services.ts"
  "middleware.ts"
  "app/providers.tsx"
  "app/api/edgestore/[...edgestore]/route.ts"
  "components/ui/skeleton.tsx"
  "components/modals/confirm-modal.tsx"
  "components/toolbar.tsx"
  "components/cover.tsx"
  "components/editor.tsx"
  "components/siri-glow-invert.tsx"
)

for f in "${keep_ours[@]}"; do
  if git ls-files --unmerged -- "$f" >/dev/null 2>&1 && [ -f "$f" ]; then
    echo "Accept OURS: $f"
    git checkout --ours -- "$f" || true
    git add "$f" || true
  fi
done

# 3) Prefer THEIRS for lockfiles to avoid npm/yarn churn (we'll regen anyway)
for f in package-lock.json yarn.lock pnpm-lock.yaml; do
  if git ls-files --unmerged -- "$f" >/dev/null 2>&1; then
    echo "Accept THEIRS: $f"
    git checkout --theirs -- "$f" || true
    git add "$f" || true
  fi
done

# 4) Catch-all: leave any remaining conflicts for manual review
left=$(git diff --name-only --diff-filter=U || true)
if [ -n "$left" ]; then
  echo
  echo "Still conflicted (open these in your editor):"
  echo "$left"
  exit 2
fi

# 5) Finalize
git commit -m "Resolve merge conflicts favoring fix/build-from-ca03bb6f baselines"
echo "✅ Merge conflicts resolved."
