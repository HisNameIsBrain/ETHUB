import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ✅ Get all active orders (not archived)
export const getAll = query(async (ctx) => {
  return await ctx.db
    .query("orders")
    .filter((q) => q.eq(q.field("isArchived"), false))
    .collect();
});

// ✅ Get orders by user ID
export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();
  },
});

// ✅ Get a single order by ID
export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ✅ Get all archived orders
export const getTrash = query(async (ctx) => {
  return await ctx.db
    .query("orders")
    .filter((q) => q.eq(q.field("isArchived"), true))
    .collect();
});

// ✅ Create a new order
export const create = mutation({
  args: {
    serviceId: v.id("services"),
    userId: v.string(),
    imei: v.string(),
    serial: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      ...args,
      isArchived: false,
    });
  },
});

// ✅ Update order status and/or notes
export const update = mutation({
  args: {
    id: v.id("orders"),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...rest }) => {
    await ctx.db.patch(id, rest);
  },
});

// ✅ Soft-delete (archive) an order
export const archive = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { isArchived: true });
  },
});

// ✅ Restore archived order
export const restore = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { isArchived: false });
  },
});

// ✅ Permanently delete an order
export const remove = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});