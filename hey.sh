#!/bin/bash

set -e

FUNCTIONS_DIR="./convex/functions"

echo "Creating folder structure..."
mkdir -p "$FUNCTIONS_DIR/documents"
mkdir -p "$FUNCTIONS_DIR/services"

echo "Writing documents/getById.ts..."
cat > "$FUNCTIONS_DIR/documents/getById.ts" << 'EOF'
import { query } from "convex/server";
import { Id } from "../_generated/dataModel";

export const getById = query(async ({ db }, args: { documentId: Id }) => {
  const document = await db.get(args.documentId);
  return document;
});
EOF

echo "Writing documents/update.ts..."
cat > "$FUNCTIONS_DIR/documents/update.ts" << 'EOF'
import { mutation } from "convex/server";
import { Id } from "../_generated/dataModel";

export const update = mutation(async ({ db }, args: { documentId: Id; data: any }) => {
  await db.patch(args.documentId, args.data);
  return { success: true };
});
EOF

echo "Writing services/getById.ts..."
cat > "$FUNCTIONS_DIR/services/getById.ts" << 'EOF'
import { query } from "convex/server";
import { Id } from "../_generated/dataModel";

export const getById = query(async ({ db }, args: { serviceId: Id }) => {
  const service = await db.get(args.serviceId);
  return service;
});
EOF

echo "Writing services/update.ts..."
cat > "$FUNCTIONS_DIR/services/update.ts" << 'EOF'
import { mutation } from "convex/server";
import { Id } from "../_generated/dataModel";

export const update = mutation(async ({ db }, args: { serviceId: Id; data: any }) => {
  await db.patch(args.serviceId, args.data);
  return { success: true };
});
EOF

echo "Running 'npx convex codegen' to regenerate API client..."
npx convex codegen

echo "Done! Convex functions set up and API client regenerated."
