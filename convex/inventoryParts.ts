import { query } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: v.object({ limit: v.optional(v.number()) }),
  handler: async (ctx, { limit = 200 }) => {
    return await ctx.db
      .query("inventoryParts")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});
