// convex/services.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** -------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------*/
function slugify(input: string): string {
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

/** -------------------------------------------------------------
 * Queries
 * ------------------------------------------------------------*/
export const getPublicServices = query({
  args: {},
  handler: async (ctx) => {
    // Use an index for performance; filter archived in JS (or add a compound index if needed)
    const items = await ctx.db
      .query("services")
      .withIndex("by_isPublic", (q: any) => q.eq("isPublic", true))
      .collect();
    
    return items.filter((s: any) => !s.archived);
  },
});

/** -------------------------------------------------------------
 * Mutations
 * ------------------------------------------------------------*/
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { name, description, price, isPublic }) => {
    const identity = await requireIdentity(ctx);
    
    const now = Date.now();
    const slug = slugify(name);
    
    // (Optional) ensure slug uniqueness per user
    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
    const finalSlug =
      existing && existing.createdBy === identity.subject ?
      `${slug}-${now}` :
      slug;
    
    const id = await ctx.db.insert("services", {
      name,
      description,
      price,
      createdAt: now,
      updatedAt: now,
      isPublic: isPublic ?? false,
      archived: false,
      slug: finalSlug,
      createdBy: identity.subject,
    });
    
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, name, description, price, isPublic, archived }) => {
    const identity = await requireIdentity(ctx);
    const svc = await ctx.db.get(id);
    if (!svc) throw new Error("Service not found");
    if (svc.createdBy !== identity.subject) throw new Error("Forbidden");
    
    const patch: any = { updatedAt: Date.now() };
    if (name !== undefined) {
      patch.name = name;
      patch.slug = slugify(name);
    }
    if (description !== undefined) patch.description = description;
    if (price !== undefined) patch.price = price;
    if (isPublic !== undefined) patch.isPublic = isPublic;
    if (archived !== undefined) patch.archived = archived;
    
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    const identity = await requireIdentity(ctx);
    const svc = await ctx.db.get(id);
    if (!svc) return;
    if (svc.createdBy !== identity.subject) throw new Error("Forbidden");
    await ctx.db.delete(id);
  },
});