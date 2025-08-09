#!/usr/bin/env bash
set -Eeuo pipefail

# Patch missing imports from the NextAuth/Postgres template to Clerk/Convex adapters

ROOT="ETHUB"
mkdir -p "$ROOT/lib"

# Create lib/auth.ts that re-exports Clerk server helpers
cat > "$ROOT/lib/auth.ts" <<'TS'
// lib/auth.ts - Clerk server adapters (replaces the template's NextAuth helpers)
export { auth, currentUser } from "@clerk/nextjs/server";
TS

# Create lib/db.ts as a neutral placeholder to satisfy old Prisma imports
# (Replace usages with Convex queries/mutations incrementally.)
cat > "$ROOT/lib/db.ts" <<'TS'
// lib/db.ts - Placeholder to satisfy template imports that expected a Prisma client.
// Migrate your data access to Convex; this exists only so the app builds.
const db: any = {};
export default db;
export { db };
TS

echo "Created lib/auth.ts and lib/db.ts placeholders."
echo "Now re-run your build. Replace any remaining Prisma-specific code with Convex usage as you iterate."

