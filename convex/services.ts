import { query } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: {
    id: v.id("services"), // ensures it's a valid document ID from "services"
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.id);
     return await ctx.db.get(args.id);
  },
});
import { mutation } from "convex/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.string(),
    deliveryTime: v.string(),
    price: v.string(),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.id);
    if (!service) throw new Error("Service not found");

    await ctx.db.patch(args.id, {
      name: args.name,
      deliveryTime: args.deliveryTime,
      price: args.price,
      updatedAt: Date.now(),
    });
  },
});