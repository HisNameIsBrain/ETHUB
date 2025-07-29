import { query, mutation } from "convex/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "convex/server";


export const getServiceById = query({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
