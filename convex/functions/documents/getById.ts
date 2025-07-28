import { query } from "convex/server";
import { v } from "convex/values";
import type { QueryCtx } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

export const getById = query({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx: QueryCtx, args: { id: Id<"documents"> }) => {
    return await ctx.db.get(args.id);
  },
});
