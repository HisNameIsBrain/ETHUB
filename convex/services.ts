import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function requireUserId(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity.subject;
}

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    deliveryTime: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const _id = await ctx.db.insert("services", {
      name: args.name,
      description: args.description,
      price: args.price,
      deliveryTime: args.deliveryTime,
      slug,
      isPublic: args.isPublic,
      archived: false,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
    return _id;
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    deliveryTime: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const svc = await ctx.db.get(args.id);
    if (!svc || svc.createdBy !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      ...("name" in args ? { name: args.name } : {}),
      ...("description" in args ? { description: args.description } : {}),
      ...("price" in args ? { price: args.price } : {}),
      ...("deliveryTime" in args ? { deliveryTime: args.deliveryTime } : {}),
      ...("isPublic" in args ? { isPublic: args.isPublic } : {}),
      ...("archived" in args ? { archived: args.archived } : {}),
      updatedAt: Date.now(),
    });
    return "ok";
  },
});

export const getById = query({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const row = await ctx.db
      .query("services")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
    return row ?? null;
  },
});

export const getPublicServices = query({
  args: { offset: v.optional(v.number()), limit: v.optional(v.number()) },
  handler: async (ctx, { offset = 0, limit = 20 }) => {
    const rows = await ctx.db
      .query("services")
      .withIndex("by_isPublic_archived", (q: any) => q.eq("isPublic", true).eq("archived", false))
      .collect();
    const total = rows.length;
    return { services: rows.slice(offset, offset + limit), total };
  },
});
