import { query } from "convex/server";
import { v } from "convex/values";
import type { QueryCtx } from "../_generated/server";

export const getAll = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("documents").collect();
  },
});
