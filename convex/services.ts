// convex/services.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Helpers */
function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
async function requireIdentity(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return identity;
}

/** Create */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.float64()),
    deliveryTime: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const now = Date.now();
    const baseSlug = slugify(args.name);
    
    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q: any) => q.eq("slug", baseSlug))
      .first();
    
    const slug =
      existing ? `${baseSlug}-${Math.random().toString(36).slice(2, 7)}` : baseSlug;
    
    return await ctx.db.insert("services", {
      name: args.name,
      description: args.description,
      price: args.price,
      deliveryTime: args.deliveryTime ?? "",
      slug,
      isPublic: args.isPublic ?? true,
      archived: false,
      createdAt: now,
      updatedAt: now,
      createdBy: identity.subject,
    });
  },
});

/** Update */
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
  handler: async ({ db }, { id, ...rest }) => {
    await db.patch(id, { ...rest, updatedAt: Date.now() });
  },
});

/** Public list */
export const getPublicServices = query({
  args: {},
  handler: async ({ db }) => {
    return await db
      .query("services")
      .withIndex("by_isPublic", (q: any) => q.eq("isPublic", true))
      .collect();
  },
});