import { query, mutation } from "convex/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "convex/server";


export const getDocumentById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
