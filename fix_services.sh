set -euo pipefail

ts_file="convex/services.ts"

mkdir -p convex

cat > "$ts_file" <<'TS'
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Normalize price inputs to a required `price` number.
 * - If `price` is provided, use it.
 * - Else if `priceCents` is provided, convert cents -> dollars (2 decimals).
 * - Else throw (schema requires `price`).
 */
function normalizePrice(price?: number | null, priceCents?: number | null): number {
  if (typeof price === "number") return price;
  if (typeof priceCents === "number") {
    const dollars = Math.round(priceCents) / 100;
    return Math.round(dollars * 100) / 100;
  }
  throw new Error("Missing price: provide price (number) or priceCents (number).");
}

// --- create ---
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    // Schema expects price:number required. We'll accept either and normalize.
    price: v.optional(v.number()),
    priceCents: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    button: v.optional(
      v.object({
        label: v.string(),
        href: v.string(),
        variant: v.optional(
          v.union(
            v.literal("default"),
            v.literal("secondary"),
            v.literal("outline"),
            v.literal("ghost")
          )
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const price = normalizePrice(args.price, args.priceCents);

    return await ctx.db.insert("services", {
      name: args.name,
      description: args.description,
      price,                               // ✅ match schema (required)
      isPublic: args.isPublic ?? true,
      imageUrl: args.imageUrl,
      sortOrder: args.sortOrder,
      button: args.button,
      createdAt: now,
      updatedAt: now,
      archived: false,
    });
  },
});

// --- update ---
export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    priceCents: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    button: v.optional(
      v.object({
        label: v.string(),
        href: v.string(),
        variant: v.optional(
          v.union(
            v.literal("default"),
            v.literal("secondary"),
            v.literal("outline"),
            v.literal("ghost")
          )
        ),
      })
    ),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, price, priceCents, ...rest } = args;

    const patch: Record<string, unknown> = {
      ...rest,
      updatedAt: Date.now(),
    };

    if (price !== undefined || priceCents !== undefined) {
      patch["price"] = normalizePrice(price ?? undefined, priceCents ?? undefined);
    }

    await ctx.db.patch(id, patch);
  },
});

// --- queries ---
export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("services")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("services").collect();
  },
});
TS

echo "Wrote $ts_file"

echo "Next: run 'npx convex dev' to regenerate types (if needed) and retypecheck."
