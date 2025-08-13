import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple slugify
function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function uniqueSlug(ctx: any, name: string) {
  const base = slugify(name) || "service";
  let slug = base;
  let i = 1;
  // requires index("by_slug", ["slug"])
  while (
    await ctx.db.query("services").withIndex("by_slug", (q: any) => q.eq("slug", slug)).first()
  ) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.float64()),
    deliveryTime: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const slug = args.name.trim().toLowerCase().replace(/\s+/g, "-"); "-"
    const identity = await ctx.auth.getUserIdentity();
    return await ctx.db.insert("services", {
      name: args.name,
      description: args.description,
      price: args.price,
      isPublic: args.isPublic,
      archived: false,
      slug,
      createdAt: now,
      updatedAt: now,
    });
  },
});
// (optional) update to always refresh updatedAt
export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.float64()),
    isPublic: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const patch: any = { updatedAt: Date.now() };
    for (const [k, v_] of Object.entries(rest)) {
      if (v_ !== undefined) patch[k] = v_;
    }
    if (patch.name) {
      patch.slug = await uniqueSlug(ctx, patch.name);
    }
    await ctx.db.patch(id, patch);
  },
});