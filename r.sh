#!/usr/bin/env bash
set -eu

echo "=== ETHUB: applying safe patches ==="

file_exists() { [ -f "$1" ]; }

# 0) Convex migration: use literal table name
F='convex/migrations.backfill-docs.ts'
if file_exists "$F"; then
  sed -i 's/\.query([[:space:]]*table[[:space:]]*)/.query("documents")/' "$F" || true
  echo "patched: $F (query -> documents)"
fi

# 1) Navbar: purge broken Title/Publish imports and re-add correct named imports
F='app/(main)/_components/navbar.tsx'
if file_exists "$F"; then
  TMP="$(mktemp)"
  # Remove any line importing Title/Publish (default, named, or mangled)
  grep -v -E '(^|\\)import[[:space:]]+(\{?[[:space:]]*)?Title(\}?)[[:space:]]+from|(^|\\)import[[:space:]]+(\{?[[:space:]]*)?Publish(\}?)[[:space:]]+from|^[[:space:]]*\\1import' "$F" > "$TMP"

  HEAD_LINE="$(head -n1 "$TMP" || true)"
  {
    # Preserve "use client" if present
    if printf '%s' "$HEAD_LINE" | grep -qE '^[\"\047]use[[:space:]]+client[\"\047];?$'; then
      head -n1 "$TMP"
      echo 'import { Title } from "@/app/(main)/_components/title";'
      echo 'import { Publish } from "@/app/(main)/_components/publish";'
      tail -n +2 "$TMP"
    else
      echo 'import { Title } from "@/app/(main)/_components/title";'
      echo 'import { Publish } from "@/app/(main)/_components/publish";'
      cat "$TMP"
    fi
  } > "$F"
  rm -f "$TMP"
  echo "patched: $F (Title/Publish named imports)"
fi

# 2) search-command: pass "skip" when no term
F='components/search-command.tsx'
if file_exists "$F"; then
  sed -i 's/useQuery(api\.documents\.getSearch,[[:space:]]*term[[:space:]]*?[[:space:]]*{[[:space:]]*term[[:space:]]*}[[:space:]]*:[[:space:]]*undefined)/useQuery(api.documents.getSearch, term ? { term } : "skip")/' "$F" || true
  echo "patched: $F (skip param)"
fi

# 3) dashboard create payload: remove unsupported `archived`
F='app/dashboard/page.tsx'
if file_exists "$F"; then
  # drop lines that contain `archived: false`
  sed -i '/[[:space:]]archived:[[:space:]]*false,?[[:space:]]*$/d' "$F" || true
  echo "patched: $F (removed archived payload)"
fi

# 4) ensure-user: ensure .upsert (not .ensureByToken)
F='components/ensure-user.tsx'
if file_exists "$F"; then
  sed -i 's/\.ensureByToken/\.upsert/g' "$F" || true
  echo "patched: $F (users.upsert)"
fi

# 5) marketing services: force getPublic query
F='app/marketing/services/page.tsx'
if file_exists "$F"; then
  sed -i 's/useQuery(api\.services\.[A-Za-z_]\+)/useQuery(api.services.getPublic)/g' "$F" || true
  echo "patched: $F (services.getPublic)"
fi

# 6) documents index route: force getAll
F='app/(main)/(routes)/documents/page.tsx'
if file_exists "$F"; then
  sed -i 's/useQuery(api\.documents\.[A-Za-z_]\+)/useQuery(api.documents.getAll)/g' "$F" || true
  echo "patched: $F (documents.getAll)"
fi

# 7) trash box: force getTrash
F='app/(main)/_components/trash-box.tsx'
if file_exists "$F"; then
  sed -i 's/useQuery(api\.documents\.[A-Za-z_]\+)/useQuery(api.documents.getTrash)/g' "$F" || true
  echo "patched: $F (documents.getTrash)"
fi

# 8) actions: ensure services.remove for fetchMutation calls
F='app/dashboard/_components/actions.ts'
if file_exists "$F"; then
  sed -i 's/fetchMutation(api\.services\.[A-Za-z_]\+,/fetchMutation(api.services.remove,/g' "$F" || true
  echo "patched: $F (services.remove)"
fi

echo "=== Done. Now regenerate Convex types, then build ==="
echo "npx convex dev   # let it run once to regenerate, then Ctrl+C"
echo "pnpm build"
