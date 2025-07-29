import { query, mutation } from "convex/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "convex/server";


export const removeService = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
