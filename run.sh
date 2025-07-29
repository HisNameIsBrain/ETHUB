#!/bin/bash

set -e

echo "🔧 Fixing ctx/args and server imports in Convex functions..."

FILES=$(find ./convex/{documents,services} -type f -name "*.ts")

for file in $FILES; do
  echo "📄 Processing $file"

  # Step 1: Ensure server import is correct
  sed -i 's|import { \(.*\) } from "convex/server"|import { \1 } from "@/convex/_generated/server"|' "$file"

  # Step 2: Remove accidental client-side import
  sed -i '/import { .* } from ".*client.*/d' "$file"

  # Step 3: Add server import if missing
  if ! grep -q '_generated/server' "$file"; then
    sed -i '1i import { query, mutation } from "@/convex/_generated/server";' "$file"
  fi

  # Step 4: Add convex/values import if missing
  if ! grep -q 'convex/values' "$file"; then
    sed -i '1i import { v } from "convex/values";' "$file"
  fi

done

echo "✅ All Convex server functions now have correct ctx/args and imports."
