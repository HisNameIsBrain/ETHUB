import { query, mutation } from "convex/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "convex/server";

import { query } from "./_generated/api";
import type { QueryCtx } from "./_generated/api";

export const getAll = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("services").collect();
  },
});