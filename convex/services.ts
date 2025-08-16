import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- utils ---
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
  // eslint-disable-next-line no-await-in-loop
  while (await ctx.db.query("services").withIndex("by_slug", (q: any) => q.eq("slug", slug)).first()) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

// --- mutations ---
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
    const slug = await uniqueSlug(ctx, args.name);
    
    return await ctx.db.insert("services", {
      name: args.name,
      description: args.description,
      price: args.price,
      deliveryTime: args.deliveryTime,
      isPublic: args.isPublic,
      slug,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.float64()),
    deliveryTime: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const patch: Record < string, unknown > = { updatedAt: Date.now() };
    
    for (const [k, v_] of Object.entries(rest)) {
      if (v_ !== undefined) patch[k] = v_;
    }
    if (patch.name && typeof patch.name === "string") {
      patch.slug = await uniqueSlug(ctx, patch.name);
    }
    
    await ctx.db.patch(id, patch);
  },
});

// delete a specific service by id (use to remove the bad row)
export const removeById = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// --- queries ---
export const getPublics = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("services").collect();
    return all
      .filter((s) => s.isPublic)
      .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  },
});