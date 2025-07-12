import { query } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: {
    id: v.id("services"), // ensures it's a valid document ID from "services"
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.id);
    return service;
  },
});