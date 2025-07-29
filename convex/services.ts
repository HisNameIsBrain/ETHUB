// convex/services.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getAllServices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("services").collect();
  },
});

export const getServiceById = query({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createService = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    deliveryTime: v.string(),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    orgId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("services", {
      ...args,
      isArchived: false,
    });
  },
});

export const updateService = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    deliveryTime: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const removeService = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});