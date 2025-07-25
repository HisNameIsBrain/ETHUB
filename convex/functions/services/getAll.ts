import { query } from "@/convex/_generated/serverd/server";
import type { QueryCtx } from "@/convex/_generated/serverd/server";

export const getAll = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("services").collect();
  },
});