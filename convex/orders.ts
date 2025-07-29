// convex/orders.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrdersByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const createOrder = mutation({
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
    return await ctx.db.insert("orders", args);
  },
});

export const updateOrderStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      notes: args.notes,
    });
  },
});

export const deleteOrder = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});