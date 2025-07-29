import { query, mutation } from "convex/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "convex/server";


export const createService = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.optional(v.string()),
    userId: v.string(),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("services", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});
