import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new service
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    deliveryTime: v.optional(v.string()),
    isPublic: v.boolean(),
    slug: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const now = Date.now();
    return await ctx.db.insert("services", {
      name: args.name,
      description: args.description,
      price: args.price,
      deliveryTime: args.deliveryTime,
      isPublic: args.isPublic,
      archived: false, // ✅ always set on insert
      slug: args.slug,
      createdAt: now,
      updatedAt: now,
      createdBy: identity.subject,
    });
  },
});

// Update an existing service
export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    deliveryTime: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    slug: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const service = await ctx.db.get(args.id);
    if (!service) throw new Error("Not found");

    const now = Date.now();
    await ctx.db.patch(args.id, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.description !== undefined ? { description: args.description } : {}),
      ...(args.price !== undefined ? { price: args.price } : {}),
      ...(args.deliveryTime !== undefined ? { deliveryTime: args.deliveryTime } : {}),
      ...(args.isPublic !== undefined ? { isPublic: args.isPublic } : {}),
      ...(args.slug !== undefined ? { slug: args.slug } : {}),
      updatedAt: now,
    });
  },
});

// Archive a service
export const archive = mutation({
  args: { id: v.id("services") },
  async handler(ctx, args) {
    await ctx.db.patch(args.id, { archived: true, updatedAt: Date.now() });
  },
});

// Restore a service
export const restore = mutation({
  args: { id: v.id("services") },
  async handler(ctx, args) {
    await ctx.db.patch(args.id, { archived: false, updatedAt: Date.now() });
  },
});

// Get by ID
export const getById = query({
  args: { id: v.id("services") },
  async handler(ctx, args) {
    return await ctx.db.get(args.id);
  },
});

// Get all active (not archived)
export const getAll = query({
  args: {},
  async handler(ctx) {
    return await ctx.db
      .query("services")
      .withIndex("by_archived", (q) => q.eq("archived", false))
      .collect();
  },
});

// Get archived (trash)
export const getTrash = query({
  args: {},
  async handler(ctx) {
    return await ctx.db
      .query("services")
      .withIndex("by_archived", (q) => q.eq("archived", true))
      .collect();
  },
});

// Permanently remove
export const remove = mutation({
  args: { id: v.id("services") },
  async handler(ctx, args) {
    await ctx.db.delete(args.id);
  },
});
