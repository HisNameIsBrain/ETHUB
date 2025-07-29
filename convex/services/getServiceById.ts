import { query, mutation } from "@/convex/_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "@/convex/_generated/server";
import type { Id } from "@/convex/_generated/dataModel";

export const getServiceById = query({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
