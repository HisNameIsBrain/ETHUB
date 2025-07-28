import { query } from "./_generated/api";
import type { QueryCtx } from "./_generated/api";

export const getAll = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("services").collect();
  },
});