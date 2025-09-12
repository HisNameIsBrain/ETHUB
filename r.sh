#!/usr/bin/env bash
set -euo pipefail

echo "=== ETHUB Guardrails v2: append-only logs; zero duplicate imports ==="

ROOT="${PWD}"
SCHEMA="${ROOT}/convex/schema.ts"
LOGS_TS="${ROOT}/convex/logs.ts"

fail(){ echo "ERROR: $*" >&2; exit 1; }
ts(){ date +%Y%m%d-%H%M%S; }

[[ -f "$SCHEMA" ]] || fail "convex/schema.ts not found. Run from repo root."
grep -q 'defineSchema' "$SCHEMA" || fail "schema.ts missing defineSchema(...)."

backup="$SCHEMA.bak.$(ts)"
cp "$SCHEMA" "$backup"
echo "Backup: $(basename "$backup")"

# --- 0) Import hygiene: augment, don't duplicate ---
# Ensure: import { defineSchema, defineTable } from "convex/server";
if grep -q 'from "convex/server"' "$SCHEMA"; then
  # augment missing specifiers in-place
  if ! grep -q 'import\s*{[^}]*defineSchema' "$SCHEMA"; then
    sed -i 's|from "convex/server";|, defineSchema from "convex/server";|; t; s|import \{|\0 defineSchema,|; t' "$SCHEMA"
  fi
  if ! grep -q 'import\s*{[^}]*defineTable' "$SCHEMA"; then
    # insert defineTable into the same import brace set
    awk '
      BEGIN{done=0}
      /import[ \t]*\{[^}]*\}[ \t]*from[ \t]*"convex\/server"[ \t]*;/ && !done {
        line=$0
        sub(/\}[ \t]*from[ \t]*"convex\/server"[ \t]*;/, ", defineTable } from \"convex/server\";", line)
        print line
        done=1; next
      }
      {print}
    ' "$SCHEMA" > "$SCHEMA.tmp" && mv "$SCHEMA.tmp" "$SCHEMA"
  fi
else
  # add single import line once
  sed -i '1i import { defineSchema, defineTable } from "convex/server";' "$SCHEMA"
fi

# Ensure: import { v } from "convex/values";
if grep -q 'from "convex/values"' "$SCHEMA"; then
  if ! grep -q 'import\s*{[^}]*\bv\b' "$SCHEMA"; then
    awk '
      BEGIN{done=0}
      /import[ \t]*\{[^}]*\}[ \t]*from[ \t]*"convex\/values"[ \t]*;/ && !done {
        line=$0
        sub(/\}[ \t]*from[ \t]*"convex\/values"[ \t]*;/, ", v } from \"convex/values\";", line)
        print line
        done=1; next
      }
      {print}
    ' "$SCHEMA" > "$SCHEMA.tmp" && mv "$SCHEMA.tmp" "$SCHEMA"
  fi
else
  sed -i '1i import { v } from "convex/values";' "$SCHEMA"
fi

# --- 1) Append-only injection of assistantLogs (if absent) ---
if grep -q 'assistantLogs\s*:' "$SCHEMA"; then
  echo "assistantLogs already present (no schema changes)."
else
  BLOCK='  assistantLogs: defineTable({
    userId: v.optional(v.string()),
    userKeyHmac: v.optional(v.string()),
    promptHashHmac: v.optional(v.string()),
    modelUsed: v.optional(v.string()),
    promptRedacted: v.optional(v.string()),
    answerRedacted: v.optional(v.string()),
    ok: v.boolean(),
    status: v.optional(v.number()),
    code: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    createdAt: v.number(),
  }),'

  awk -v INS="$BLOCK" '
    BEGIN{inobj=0; inserted=0}
    /defineSchema\(\s*{\s*$/ { inobj=1 }
    {
      if (inobj && $0 ~ /^\s*}\)\s*;?\s*$/ && !inserted) {
        print INS
        inserted=1
      }
      print
      if (inobj && $0 ~ /^\s*}\)\s*;?\s*$/) inobj=0
    }
    END{ if (!inserted) exit 42 }
  ' "$SCHEMA" > "$SCHEMA.tmp" || fail "Could not append assistantLogs (no change applied)."

  # sanity: only growth allowed
  old=$(wc -l < "$SCHEMA"); new=$(wc -l < "$SCHEMA.tmp")
  [[ "$new" -gt "$old" ]] || fail "Append-only check failed (size not increased)."

  # diff preview
  if command -v git >/dev/null 2>&1; then
    echo "---- DIFF (schema.ts) ----"
    git --no-pager diff --no-index "$SCHEMA" "$SCHEMA.tmp" || true
    echo "--------------------------"
  else
    diff -u "$SCHEMA" "$SCHEMA.tmp" || true
  fi

  mv "$SCHEMA.tmp" "$SCHEMA"
  echo "✓ Injected assistantLogs (append-only)."
fi

# --- 2) Create convex/logs.ts if missing (idempotent) ---
if [[ -f "$LOGS_TS" ]]; then
  echo "convex/logs.ts exists (unchanged)."
else
  cat > "$LOGS_TS" <<'TS'
// convex/logs.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    userKeyHmac: v.optional(v.string()),
    promptHashHmac: v.optional(v.string()),
    modelUsed: v.optional(v.string()),
    promptRedacted: v.optional(v.string()),
    answerRedacted: v.optional(v.string()),
    ok: v.boolean(),
    status: v.optional(v.number()),
    code: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("assistantLogs", { ...args, createdAt: Date.now() });
    return true;
  },
});
TS
  echo "✓ Wrote convex/logs.ts"
fi

# --- 3) Upgrade string-based runMutation -> typed api.logs.create, no duplicate imports ---
fix_runmutation_file() {
  local f="$1"
  [[ "$f" == *.ts ]] || return 0
  grep -q 'ctx\.runMutation("logs:create"' "$f" || return 0

  # add or augment api import
  if grep -q '_generated/api' "$f"; then
    # ensure "api" is imported exactly once
    if ! grep -q 'import\s*{[^}]*\bapi\b' "$f"; then
      # if import exists but without api, add api to that line
      awk '
        BEGIN{done=0}
        /import[ \t]*\{[^}]*\}[ \t]*from[ \t]*"\.\/_generated\/api"[ \t]*;/ && !done {
          line=$0
          sub(/\}/, ", api }", line)
          print line
          done=1; next
        }
        {print}
      ' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
    fi
  else
    # add full import once
    sed -i '1i import { api } from "./_generated/api";' "$f"
  fi

  sed -i 's/ctx\.runMutation("logs:create"/ctx.runMutation(api.logs.create/g' "$f"
  echo "Patched runMutation -> api.logs.create in $f"
}
export -f fix_runmutation_file
find "$ROOT/convex" -maxdepth 1 -type f -name "*.ts" -print0 | xargs -0 -I{} bash -c 'fix_runmutation_file "$@"' _ {}

echo
echo "=== Next steps ==="
echo "1) npx convex dev       # migrate assistantLogs"
echo "2) npx convex codegen   # regenerate types"
echo "3) pnpm dev             # or npm run build"
echo
echo "Rules enforced: append-only injection; import augmentation (no duplicates); no edits to documents/services/users."
