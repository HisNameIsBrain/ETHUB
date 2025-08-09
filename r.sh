#!/usr/bin/env bash
set -euo pipefail

# Root (adjust if your convex dir is somewhere else)
CONVEX_DIR="convex"

# Ensure directory exists
if [[ ! -d "$CONVEX_DIR" ]]; then
  echo "Error: '$CONVEX_DIR' directory not found. Run this from your project root or edit CONVEX_DIR." >&2
  exit 1
fi

############################################
# 1) schema.fixed.ts
# - Ensures users table has tokenIdentifier/imageUrl/createdAt/updatedAt
# - Puts by_userId and by_token indexes on users
############################################
cat > "$CONVEX_DIR/schema.fixed.ts" <<'TS'
import { defineSchema, defineTable, v } from "convex/schema";

export default defineSchema({
  users: defineTable({
    userId: v.string(),                       // Clerk subject/id
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    imageUrl: v.optional(v.string()),         // keep consistent: imageUrl (not pictureUrl)
    role: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),  // for by_token index
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_token", ["tokenIdentifier"]),

  // --- keep/extend your other tables below as needed ---
  // Example placeholders (remove if you already have your definitions):
  documents: defineTable({
    content: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    title: v.optional(v.string()),
    isPublished: v.boolean(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  services: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
TS

############################################
# 2) services.fixed.ts
# - Example of a properly typed Convex query using ctx and identity
# - Replaces the broken snippet that referenced ctx/identity/q incorrectly
############################################
cat > "$CONVEX_DIR/services.fixed.ts" <<'TS'
import { query } from "./_generated/server";

/**
 * getUserByToken
 * Reads the current identity and fetches the user via the "by_token" index.
 * Returns the user document or null.
 */
export const getUserByToken = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.tokenIdentifier) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    return user ?? null;
  },
});
TS

############################################
# 3) users.fixed.tsx
# - Upserts current user with required fields: userId, createdAt, updatedAt
# - Makes email lowercase; keeps naming consistent (imageUrl)
############################################
cat > "$CONVEX_DIR/users.fixed.tsx" <<'TSX'
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertCurrentUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { email, name, username, phoneNumber, imageUrl }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject; // Clerk user id
    const tokenIdentifier = identity.tokenIdentifier ?? undefined;
    const now = Date.now();
    const lower = email.toLowerCase();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: lower,
        name,
        username,
        phoneNumber,
        imageUrl,
        tokenIdentifier,
        updatedAt: now,
      });
      return existing._id;
    }

    const id = await ctx.db.insert("users", {
      userId,
      email: lower,
      name,
      username,
      phoneNumber,
      imageUrl,
      tokenIdentifier,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Optional: ensureUser(tokenIdentifier, ...)
 * If you need a path that doesn't rely on auth in this call, you can use this.
 */
export const ensureUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { tokenIdentifier, name, email, imageUrl }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (existing) return existing._id;

    const now = Date.now();
    const id = await ctx.db.insert("users", {
      userId: "", // fill this with a real id if available in your flow
      tokenIdentifier,
      name: name ?? "Anonymous",
      email: (email ?? "").toLowerCase(),
      imageUrl: imageUrl ?? "",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});
TSX

echo "------------------------------------------------------------"
echo "Created:"
echo "  - $CONVEX_DIR/schema.fixed.ts"
echo "  - $CONVEX_DIR/services.fixed.ts"
echo "  - $CONVEX_DIR/users.fixed.tsx"
echo
echo "Next steps:"
echo "  1) Diff and merge your originals with the *.fixed.ts(x) files."
echo "     For example:"
echo "        diff -u $CONVEX_DIR/schema.ts $CONVEX_DIR/schema.fixed.ts | less"
echo "        diff -u $CONVEX_DIR/services.ts $CONVEX_DIR/services.fixed.ts | less"
echo "        diff -u $CONVEX_DIR/users.tsx $CONVEX_DIR/users.fixed.tsx | less"
echo "  2) Ensure your code references 'imageUrl' consistently (not 'pictureUrl')."
echo "  3) Make sure no other tables have a stray .index(\"by_token\", [\"tokenIdentifier\"])."
echo "  4) Rebuild:  pnpm convex dev  (or your build command)."
echo "------------------------------------------------------------"
