import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function slugify(name: string) {
  return name.trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// convex/services.ts
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.float64()),
    deliveryTime: v.optional(v.string()), // <-- include here too
    isPublic: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    // ...
    await ctx.db.insert("services", {
      name: args.name,
      description: args.description,
      price: args.price,
      deliveryTime: args.deliveryTime ?? "", // <-- now valid
      slug: finalSlug,
      isPublic: args.isPublic ?? true,
      archived: false,
      createdAt: now,
      updatedAt: now,
      createdBy: identity.subject,
    });
  },
});
    const id = await db.insert("services", {
      name: args.name,
      description: args.description ?? "",
      price: args.price ?? 0,
      deliveryTime: args.deliveryTime ?? "",
      isPublic: args.isPublic ?? true,
      archived: args.archived ?? false,
      slug: finalSlug,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    });args.name
    return id;
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
    archived: v.optional(v.boolean()),
  },
  handler: async ({ db }, { id, ...patch }) => {
    const svc = await db.get(id);
    if (!svc) throw new Error("Service not found");
    const next: any = { ...patch, updatedAt: Date.now() };
    if (patch.name) next.slug = slugify(patch.name);
    await db.patch(id, next);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async ({ db }, { slug }) => {
    return db.query("services").withIndex("by_slug", q => q.eq("slug", slug)).first();
  },
});