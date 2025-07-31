import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Create a new order
export const create = mutation({
  args: {
    serviceId: v.id("services"),
    imei: v.string(),
    serialNumber: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const userId = identity.subject;
    
    return await ctx.db.insert("orders", {
      ...args,
      userId,
      isArchived: false,
      createdAt: Date.now(),
    });
  },
});

// Get all active orders for the current user
export const getAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const userId = identity.subject;
    
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
  },
});

// Get all archived orders (trash)
export const getTrash = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const userId = identity.subject;
    
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();
  },
});

// Get order by ID
export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    
    if (order.userId !== identity?.subject) {
      throw new Error("Not authorized");
    }
    
    return order;
  },
});

// Update order status and notes
export const update = mutation({
  args: {
    id: v.id("orders"),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Order not found");
    
    if (existing.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Archive an order (soft-delete)
export const archive = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    if (order.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    
    return await ctx.db.patch(args.id, { isArchived: true });
  },
});

// Restore an archived order
export const restore = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    if (order.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    
    return await ctx.db.patch(args.id, { isArchived: false });
  },
});

// Permanently delete an order
export const remove = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    if (order.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    
    return await ctx.db.delete(args.id);
  },
});