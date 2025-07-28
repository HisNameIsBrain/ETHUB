import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";

export const getAll = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("services").collect();
  },
});