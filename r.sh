#!/usr/bin/env bash
set -euo pipefail

# 0) safety checkpoint
git add -A && git commit -m "checkpoint before perl fixes" >/dev/null 2>&1 || true

# 1) Ensure tolerant helper exists (accepts any shape)
mkdir -p convex/lib
cat > convex/lib/search.ts <<'EOF'
// convex/lib/search.ts
export function buildServiceSearch(s: any): string {
  if (!s) return "";
  const title = s.title ?? "";
  const category = s.category ?? "";
  const deliveryTime = s.deliveryTime ?? "";
  const notes = s.notes ?? "";
  const tags = Array.isArray(s.tags) ? s.tags.join(" ") : (s.tags ?? "");
  return [title, category, deliveryTime, notes, tags].join(" ").toLowerCase().trim();
}
EOF

# 2) Fix duplicate "search" property in services.ts patch payloads:
#    {...r, search, updatedAt: now(), search: buildServiceSearch(...)} -> {...r, updatedAt: now(), search: buildServiceSearch(...)}
perl -0777 -i -pe 's/\{([^{}]*?)\bsearch\s*,\s*updatedAt\s*:\s*now\(\)\s*,\s*search\s*:\s*buildServiceSearch/\{$1updatedAt: now(), search: buildServiceSearch/sg' convex/services.ts

# 3) Stop passing oversized objects into buildServiceSearch
perl -0777 -i -pe 's/buildServiceSearch\(\{\s*[^}]*?\.\.\.r[^}]*?\}\)/buildServiceSearch(r)/sg' convex/services.ts
perl -0777 -i -pe 's/buildServiceSearch\(\{\s*[^}]*?\.\.\.patch[^}]*?\}\)/buildServiceSearch(patch)/sg' convex/services.ts

# 4) Guarantee inserts include search: buildServiceSearch(a) (only if not already present)
#    We look for ctx.db.insert("services", { ...a, ... }) WITHOUT "search:"
perl -0777 -i -pe '
s/ctx\.db\.insert\("services",\s*\{\s*\.\.\.a,(?![^}]*\bsearch\s*:)/ctx.db.insert("services", { ...a, search: buildServiceSearch(a),/sg
' convex/services.ts

# 5) Comment out invalid s.contains(...) filters (you will replace with searchIndex later)
perl -0777 -i -pe 's/^(\s*)s\.contains\([^\n]*\),/$1\/\/ TODO: replace with withSearchIndex (removed contains)\n/mg' convex/services.ts

# 6) If this file was still an action(), flip to mutation() so ctx.db exists (no-op if already ok)
perl -0777 -i -pe 's/\baction\s*\(/mutation(/g' convex/services.ts
perl -0777 -i -pe 's/import\s*\{\s*action\s*,\s*query\s*\}\s*from\s*"\.\/_generated\/server";/import { mutation, query } from ".\/_generated\/server";/g' convex/services.ts
perl -0777 -i -pe 's/import\s*\{\s*action\s*\}\s*from\s*"\.\/_generated\/server";/import { mutation } from ".\/_generated\/server";/g' convex/services.ts

# 7) Fix lingering bad relative import in tools backfill
[ -f convex/tools/backfill_documents.ts ] && perl -0777 -i -pe 's|"./lib/search"|"../lib/search"|g' convex/tools/backfill_documents.ts || true

# 8) Show diff and run tsc
git --no-pager diff -- convex/services.ts convex/tools/backfill_documents.ts || true
echo "Running tsc..."
npx tsc || true
