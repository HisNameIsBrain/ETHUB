#!/usr/bin/env bash
set -euo pipefail

PAGE_FILE="app/services/page.tsx"
COMPONENTS_DIR="components"
REEXPORT_FILE="${COMPONENTS_DIR}/services-table.tsx"

echo "=== Checking ${PAGE_FILE} for 'use client' ==="
if ! grep -q '"use client"' "$PAGE_FILE"; then
  echo "Adding 'use client' to top of ${PAGE_FILE}"
  tmpfile=$(mktemp)
  {
    echo '"use client";'
    cat "$PAGE_FILE"
  } > "$tmpfile"
  mv "$tmpfile" "$PAGE_FILE"
else
  echo "• 'use client' already present."
fi

echo "=== Updating ServicesTable import path in ${PAGE_FILE} ==="
# Replace old import with correct path
sed -i.bak 's|@/components/services-table|@/components/services/services-table|g' "$PAGE_FILE"
rm -f "${PAGE_FILE}.bak"
echo "• Import path updated."

echo "=== Creating optional re-export for backward compatibility ==="
mkdir -p "$COMPONENTS_DIR"
if [ ! -f "$REEXPORT_FILE" ]; then
  cat > "$REEXPORT_FILE" <<'TS'
export { ServicesTable } from "@/components/services/services-table";
TS
  echo "• Created ${REEXPORT_FILE} re-export."
else
  echo "• ${REEXPORT_FILE} already exists, skipping."
fi

echo "=== Done. Review changes: ==="
grep "use client" "$PAGE_FILE" | head -n 1
grep "@/components/services/services-table" "$PAGE_FILE" | head -n 1
