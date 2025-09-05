#!/usr/bin/env bash
# fix_tsx_entities_v2.sh
# Robust, dependency-free repair for HTML-escaped quotes (&quot;) in TSX,
# plus specific Next.js router.push fixes you reported.

set -euo pipefail

red()    { printf "\033[31m%s\033[0m\n" "$*"; }
green()  { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }

# --- Preconditions -----------------------------------------------------------
if ! command -v git >/dev/null 2>&1; then
  red "Git is required. Aborting."
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  red "Run this inside your Git repository. Aborting."
  exit 1
fi

# Protect uncommitted work
if ! git diff-index --quiet HEAD --; then
  red "You have uncommitted changes. Commit or stash them before running."
  exit 1
fi

# Check npm availability (optional)
SKIP_NPM=0
if ! command -v npm >/dev/null 2>&1; then
  yellow "npm not found; will skip typecheck/build."
  SKIP_NPM=1
fi

# --- Safety branch -----------------------------------------------------------
ts="$(date +%Y%m%d-%H%M%S)"
branch="fix/tsx-entities-$ts"
git checkout -b "$branch" >/dev/null 2>&1 || {
  red "Could not create branch $branch"
  exit 1
}
green "Created safety branch: $branch"

# --- Gather TSX files --------------------------------------------------------
mapfile -t files < <(find app components -type f -name "*.tsx" 2>/dev/null | sort || true)

if [[ ${#files[@]} -eq 0 ]]; then
  yellow "No .tsx files found under app/ or components/. Nothing to do."
  exit 0
fi

# --- Apply targeted fixes with backups ---------------------------------------
changed=()

for f in "${files[@]}"; do
  # Make a backup once per file (portable across GNU/BSD)
  cp -- "$f" "$f.bak" 2>/dev/null || cp "$f" "$f.bak"

  # Use Perl for UTF-8 safe in-place edits
  # 1) &quot; -> "
  # 2) router.push("...${...}...") -> router.push(`...${...}...`)
  # 3) router.push("/") as Route -> router.push("/")
  perl -Mopen=,:utf8 -0777 -i -pe '
    # 1) HTML entity to real quotes
    s/&quot;/"/g;

    # 2) Only inside router.push("...") replace quotes with backticks
    #    when the string contains a ${...} interpolation.
    s/router\.push\("([^"]*\$\{[^"]+\}[^"]*)"\)/router.push(`$1`)/g;

    # 3) Remove unnecessary cast: router.push("/") as Route
    s/router\.push\("\/"\)\s+as\s+Route/router.push("\/")/g;
  ' "$f"

  # Track if the file changed by comparing to backup
  if ! cmp -s "$f" "$f.bak"; then
    changed+=("$f")
  else
    # If unchanged, remove backup to avoid clutter
    rm -f -- "$f.bak"
  fi
done

if [[ ${#changed[@]} -eq 0 ]]; then
  yellow "No changes were needed. (Either already fixed or patterns not found.)"
  exit 0
fi

green "Modified files:"
printf ' - %s\n' "${changed[@]}"

yellow "Backup copies were written next to originals with .bak suffix."

# --- Show a unified diff -----------------------------------------------------
yellow "Diff preview (staged changes not added yet):"
git --no-pager diff --color

# --- Try typecheck/build (optional) ------------------------------------------
if [[ "$SKIP_NPM" -eq 0 ]]; then
  yellow "Running npm typecheck…"
  if npm run -s typecheck; then
    green "Typecheck passed."
  else
    red "Typecheck reported issues. You can restore any file from its .bak or reset the branch."
    # Keep going so you can still see build if you want; comment next two lines to stop here.
  fi

  yellow "Running npm build…"
  if npm run -s build; then
    green "Build passed."
  else
    red "Build failed. Review errors. To revert this branch completely:"
    printf "  git reset --hard && git checkout - && git branch -D %s\n" "$branch"
    exit 1
  fi
else
  yellow "Skipping npm steps. Manually run: npm run typecheck && npm run build"
fi

green "All edits applied safely on branch: $branch"
yellow "If you like the changes:"
printf "  git add -A && git commit -m \"fix(tsx): replace &quot; -> \\\"; normalize router.push()\"\n"
printf "  git checkout - && git merge %s\n" "$branch"
yellow "If you want to revert a specific file:"
printf "  mv path/to/file.tsx.bak path/to/file.tsx && git checkout -- path/to/file.tsx\n"
