#!/usr/bin/env bash
# fix_tsx_entities.sh
# Safely fix HTML-escaped quotes in TSX and clean up a couple of Next.js route patterns.

set -euo pipefail

red()   { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$*"; }

# --- Preconditions -----------------------------------------------------------
if ! command -v git >/dev/null 2>&1; then
  red "Git is required. Aborting."
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  red "This script must be run inside a Git repository. Aborting."
  exit 1
fi

# Ensure clean working tree to avoid messing up uncommitted work
if ! git diff-index --quiet HEAD --; then
  red "Your working tree has uncommitted changes. Please commit or stash first."
  exit 1
fi

# Optional: ensure npm exists
if ! command -v npm >/dev/null 2>&1; then
  yellow "npm not found in PATH. Skipping typecheck/build step."
  SKIP_NPM=1
else
  SKIP_NPM=0
fi

# --- Create a safety branch --------------------------------------------------
ts="$(date +%Y%m%d-%H%M%S)"
branch="fix/html-entities-tsx-$ts"
git checkout -b "$branch" >/dev/null 2>&1 || {
  red "Failed to create branch $branch"
  exit 1
}
green "Created safety branch: $branch"

# --- Locate target files -----------------------------------------------------
# Scope to your code areas only
mapfile -t files < <(find app components -type f -name "*.tsx" 2>/dev/null | sort)

if [[ ${#files[@]} -eq 0 ]]; then
  yellow "No .tsx files found under app/ or components/. Nothing to do."
  exit 0
fi

# Filter to files that actually contain &quot; or the known bad patterns
mapfile -t targets < <(
  rg -l --fixed-strings --glob '!**/*.d.tsx' \
    --glob 'app/**/*.tsx' --glob 'components/**/*.tsx' \
    '&quot;' 'router.push("/documents/${id}")' 'router.push("/") as Route' 2>/dev/null || true
)

if [[ ${#targets[@]} -eq 0 ]]; then
  yellow "No matching issues found. Nothing to change."
  exit 0
fi

green "Files to modify:"
printf ' - %s\n' "${targets[@]}"

# --- Apply fixes -------------------------------------------------------------
# 1) Replace HTML-escaped quotes with real quotes
#    This is a precise replacement: &quot; -> "
#    We do in-place edits using Perl for portability and UTF-8 safety.
for f in "${targets[@]}"; do
  perl -Mopen=,:utf8 -0777 -pe 's/&quot;/"/g' -i "$f"
done

# 2) Fix template-literal route: "/documents/${id}" -> `/documents/${id}`
#    Only when used directly inside router.push("...") to avoid false positives.
#    This makes interpolation actually work.
for f in "${targets[@]}"; do
  perl -Mopen=,:utf8 -0777 -i -pe '
    s/router\.push\("([^"]*\$\{[^"]+\}[^"]*)"\)/router.push(`$1`)/g
  ' "$f"
done

# 3) Drop unnecessary cast: router.push("/") as Route -> router.push("/")
for f in "${targets[@]}"; do
  perl -Mopen=,:utf8 -0777 -i -pe '
    s/router\.push\("\/"\)\s+as\s+Route/router.push("\/")/g
  ' "$f"
done

# --- Show changes ------------------------------------------------------------
yellow "Diff preview:"
git --no-pager diff --color

# --- Try to build (optional) -------------------------------------------------
if [[ "$SKIP_NPM" -eq 0 ]]; then
  yellow "Running npm typecheck (if configured)…"
  if npm run -s typecheck; then
    green "Typecheck passed."
  else
    red "Typecheck reported issues. Review the diff above."
  fi

  yellow "Running npm build (SSR/hydration check)…"
  if npm run -s build; then
    green "Build passed."
  else
    red "Build failed. Review errors; you can always 'git reset --hard' to revert."
    exit 1
  fi
else
  yellow "Skipping npm steps; verify manually with: npm run typecheck && npm run build"
fi

green "Edits applied safely on branch: $branch"
yellow "If everything looks good:"
printf "  git add -A && git commit -m \"fix(tsx): replace &quot; -> \\\" and clean router.push patterns\"\n"
printf "  git checkout - && git merge %s\n" "$branch"
