#!/bin/bash
set -e

FUNCTIONS_DIR="./convex/functions"
DOCS_DIR="$FUNCTIONS_DIR/documents"

echo "Creating documents folder..."
mkdir -p "$DOCS_DIR"

echo "Writing documents/getAll.ts..."
cat > "$DOCS_DIR/getAll.ts" << 'EOF'
import { query } from "convex/server";
import { v } from "convex/values";
import type { QueryCtx } from "../_generated/server";

export const getAll = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("documents").collect();
  },
});
EOF

echo "Writing documents/getById.ts..."
cat > "$DOCS_DIR/getById.ts" << 'EOF'
import { query } from "convex/server";
import { v } from "convex/values";
import type { QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export const getById = query({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx: QueryCtx, args: { id: Id<"documents"> }) => {
    return await ctx.db.get(args.id);
  },
});
EOF

echo "Writing documents/create.ts..."
cat > "$DOCS_DIR/create.ts" << 'EOF'
import { mutation } from "convex/server";
import { v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    userId: v.string(),
    orgId: v.string(),
    parentDocument: v.optional(v.id("documents")),
    isArchived: v.boolean(),
    isPublished: v.boolean(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      title: string;
      content?: string;
      coverImage?: string;
      icon?: string;
      userId: string;
      orgId: string;
      parentDocument?: Id<"documents">;
      isArchived: boolean;
      isPublished: boolean;
    }
  ) => {
    const now = Date.now();
    return await ctx.db.insert("documents", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});
EOF

echo "Writing documents/update.ts..."
cat > "$DOCS_DIR/update.ts" << 'EOF'
import { mutation } from "convex/server";
import { v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      id: Id<"documents">;
      title?: string;
      content?: string;
      coverImage?: string;
      icon?: string;
      isArchived?: boolean;
      isPublished?: boolean;
      parentDocument?: Id<"documents">;
    }
  ) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
EOF

echo "Writing documents/remove.ts..."
cat > "$DOCS_DIR/remove.ts" << 'EOF'
import { mutation } from "convex/server";
import { v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export const remove = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx: MutationCtx, args: { id: Id<"documents"> }) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
EOF

echo "Writing documents/index.ts..."
cat > "$DOCS_DIR/index.ts" << 'EOF'
export * from "./getAll";
export * from "./getById";
export * from "./create";
export * from "./update";
export * from "./remove";
EOF

echo "Done! Documents folder and API files generated."
