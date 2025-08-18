#!/usr/bin/env bash
# migrate-products-to-services.sh
# One-shot migration: products-table -> services-table (and ProductsTable/ProductRow -> ServicesTable/ServiceRow)
# Also ensures app code calls Convex `services:*` (not `products:*`).
set -euo pipefail

### Helpers #############################################################

have() { command -v "$1" >/dev/null 2>&1; }

sed_inplace() {
  local file="$1"; shift
  if have gsed; then
    gsed -i.bak "$@" "$file"
  else
    # Try GNU sed
    if sed --version >/dev/null 2>&1; then
      sed -i.bak "$@" "$file"
    else
      # BSD/macOS sed
      sed -i '' "$@" "$file"
      # create a .bak copy for safety
      cp "$file" "$file.bak" >/dev/null 2>&1 || true
    fi
  fi
}

rg_or_grep() {
  # Prefer ripgrep; fallback to grep -R (slower).
  if have rg; then
    rg "$@"
  else
    # crude fallback: grep -R with basic options
    local pattern="$1"; shift
    grep -R --line-number --binary-files=without-match -E "$pattern" "$@"
  fi
}

### Preflight ###########################################################

ROOT_FILES=("package.json" "app" "convex")
for f in "${ROOT_FILES[@]}"; do
  if [[ ! -e "$f" ]]; then
    echo "⚠️  Expected '$f' at repo root. You may not be in the project root."
  fi
done

if ! have rg; then
  echo "ℹ️  ripgrep (rg) not found; falling back to grep -R. Install rg for speed: https://github.com/BurntSushi/ripgrep"
fi

### Paths ###############################################################

OLD_FILE="app/dashboard/_components/products-table.tsx"
NEW_FILE="app/dashboard/_components/services-table.tsx"

### 0) Show current references (sanity) #################################

echo "=== Scanning for existing references of products-table / ProductsTable / ProductRow ==="
rg_or_grep 'products-table|ProductsTable|ProductRow|from .*/products-table' app || true

### 1) Rename file if it exists ########################################

if [[ -f "$OLD_FILE" ]]; then
  echo "=== Renaming file ==="
  if have git; then
    git mv -f "$OLD_FILE" "$NEW_FILE"
  else
    mv -f "$OLD_FILE" "$NEW_FILE"
  fi
  echo "Moved: $OLD_FILE -> $NEW_FILE"
else
  echo "ℹ️  $OLD_FILE not found; assuming it was already renamed."
fi

### 2) Update import paths to new file ##################################

echo "=== Updating import paths to services-table ==="
# Replace: from ".../products-table" -> from ".../services-table"
# Search only in app/ to avoid unrelated hits
MAP_FILES=$(rg_or_grep -l 'from .*/products-table' app || true)
if [[ -n "${MAP_FILES:-}" ]]; then
  while IFS= read -r f; do
    echo "  ↪ $f"
    sed_inplace "$f" 's#from "\(.*\)/products-table#from "\1/services-table#g'
    sed_inplace "$f" "s#from '\(.*\)\/products-table#from '\1/services-table#g"
  done <<< "$MAP_FILES"
else
  echo "  No import paths to update."
fi

### 3) Rename component/type identifiers in app code ####################

echo "=== Renaming component/type identifiers ==="
# ProductsTable -> ServicesTable
PT_FILES=$(rg_or_grep -l '\bProductsTable\b' app || true)
if [[ -n "${PT_FILES:-}" ]]; then
  while IFS= read -r f; do
    echo "  ↪ ProductsTable -> ServicesTable in $f"
    sed_inplace "$f" 's/\bProductsTable\b/ServicesTable/g'
  done <<< "$PT_FILES"
fi

# ProductRow -> ServiceRow
PR_FILES=$(rg_or_grep -l '\bProductRow\b' app || true)
if [[ -n "${PR_FILES:-}" ]]; then
  while IFS= read -r f; do
    echo "  ↪ ProductRow -> ServiceRow in $f"
    sed_inplace "$f" 's/\bProductRow\b/ServiceRow/g'
  done <<< "$PR_FILES"
fi

# JSX tags <ProductsTable ...> </ProductsTable> -> <ServicesTable ...> </ServicesTable>
JX_FILES=$(rg_or_grep -l '</?ProductsTable(\s|>)' app || true)
if [[ -n "${JX_FILES:-}" ]]; then
  while IFS= read -r f; do
    echo "  ↪ JSX tag rename in $f"
    sed_inplace "$f" 's#<\s*ProductsTable#<ServicesTable#g'
    sed_inplace "$f" 's#</\s*ProductsTable#</ServicesTable#g'
  done <<< "$JX_FILES"
fi

### 4) Ensure app calls Convex services:* (not products:*) ##############

echo "=== Checking for app calls to products:* (should be services:*) ==="
P_CALLS=$(rg_or_grep -n 'use(Query|Mutation)\([^)]*products:' app || true)
if [[ -n "${P_CALLS:-}" ]]; then
  echo "$P_CALLS"
  echo "=== Updating products:* -> services:* in app/ ==="
  P_FILES=$(rg_or_grep -l 'products:' app || true)
  if [[ -n "${P_FILES:-}" ]]; then
    while IFS= read -r f; do
      echo "  ↪ products: -> services: in $f"
      sed_inplace "$f" 's/products:/services:/g'
    done <<< "$P_FILES"
  fi
else
  echo "  OK: No app calls to products:* found."
fi

### 5) Quick Convex sanity ################################################

echo "=== Convex sanity checks ==="
echo "- Confirming 'services' table exists in schema:"
rg_or_grep -n "defineTable|table\(['\"]services['\"]\)" convex/schema.* || true

echo "- Listing Convex functions likely under services:"
rg_or_grep -n 'export (const|async function) .*services' convex || true

### 6) Final scan ########################################################

echo "=== Final scan for leftover product names in app/ ==="
rg_or_grep -n '\bproducts-table\b|\bProductsTable\b|\bProductRow\b|\bproducts:\b' app || true

echo "=== Done. Backups (.bak) created for modified files. ==="
echo "Next steps:"
echo "  • Update your page to import the new component:"
echo "      import { ServicesTable } from \"@/app/dashboard/_components/services-table\";"
echo "  • Re-run your dev server:  pnpm dev  (or npm/yarn)."
