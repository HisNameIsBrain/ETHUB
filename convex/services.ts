import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPublic = query({
  handler: async (ctx) => {
    return await ctx.db.query("services").collect();
  },
});

export const getById = query({
  args: {
    id: v.id("services"),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    deliveryTime: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("services", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    serviceId: v.id("services"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    deliveryTime: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.serviceId, {
      name: args.name,
      description: args.description,
      price: args.price,
      deliveryTime: args.deliveryTime,
      updatedAt: Date.now(),
    });
  },
});

export const erase = mutation({
  args: { serviceId: v.id("services") },
  handler: async (ctx, { serviceId }) => {
    await ctx.db.delete(serviceId);
  },
});

export const listAll= query({
  handler: async (ctx) => {
    return await ctx.db.query("services").collect();
  },
});
