import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ✅ Get all orders (for admin or global view)
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("orders").collect();
  },
});

// ✅ Get orders for a specific user
export const getOrdersByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ✅ Get order by ID
export const getOrderById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ✅ Create a new order
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

// ✅ Update status and notes of an order
export const updateOrderStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, notes }) => {
    await ctx.db.patch(id, { status, notes });
  },
});

// ✅ Delete an order
export const deleteOrder = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
