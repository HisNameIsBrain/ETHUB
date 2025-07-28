import { query } from "convex/server";
import { v } from "convex/values";

export const getServiceById = query({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
