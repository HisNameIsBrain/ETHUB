Here’s a bash script that:

1. Creates or overwrites the necessary Convex functions in:

convex/functions/documents

convex/functions/services



2. Applies the schema naming you requested like:

API.documents.getDocumentById

API.services.getServiceById





---

✅ generate_api_functions.sh

#!/bin/bash

set -e

BASE_DIR="./convex/functions"
DOC_DIR="$BASE_DIR/documents"
SERV_DIR="$BASE_DIR/services"

mkdir -p "$DOC_DIR" "$SERV_DIR"

echo "Generating documents functions..."

# getDocumentById
cat > "$DOC_DIR/getDocumentById.ts" << 'EOF'
import { query } from "@/convex/_generated/server";
import { v } from "convex/values";

export const getDocumentById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
EOF

# createDocument
cat > "$DOC_DIR/createDocument.ts" << 'EOF'
import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const createDocument = mutation({
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
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("documents", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});
EOF

# updateDocument
cat > "$DOC_DIR/updateDocument.ts" << 'EOF'
import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const updateDocument = mutation({
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
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
EOF

# removeDocument
cat > "$DOC_DIR/removeDocument.ts" << 'EOF'
import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const removeDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
EOF

echo "Generating services functions..."

# getServiceById
cat > "$SERV_DIR/getServiceById.ts" << 'EOF'
import { query } from "@/convex/_generated/server";
import { v } from "convex/values";

export const getServiceById = query({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
EOF

# createService
cat > "$SERV_DIR/createService.ts" << 'EOF'
import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const createService = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.optional(v.string()),
    userId: v.string(),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("services", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});
EOF

# updateService
cat > "$SERV_DIR/updateService.ts" << 'EOF'
import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const updateService = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
EOF

# removeService
cat > "$SERV_DIR/removeService.ts" << 'EOF'
import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const removeService = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
EOF

echo "Done! API functions created for documents and services."


