import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get a service by ID
 */
export const getById = query({
  args: {
    id: v.id('services'),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.id);
    return service;
  },
});

/**
 * Update a service
 */
export const update = mutation({
  args: {
    id: v.id('services'),
    name: v.string(),
    deliveryTime: v.string(),
    price: v.string(), // ← If price is numeric, use v.number() instead
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.id);
    if (!service) throw new Error('Service not found');
    
    await ctx.db.patch(args.id, {
      name: args.name,
      deliveryTime: args.deliveryTime,
      price: args.price,
      updatedAt: Date.now(),
    });
  },
});