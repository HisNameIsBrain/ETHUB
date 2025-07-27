import { query } from "@/convex/_generated/server";
import { v } from "convex/values";
import type { QueryCtx } from "@/convex/_generated/server";

export const getById = query({
  args: {
    id: v.id("services"),
  },
  handler: async (ctx: QueryCtx, args: { id: string }) => {
    return await ctx.db.get(args.id);
  },
});