import { query, mutation } from "@/convex/_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "@/convex/_generated/server";
import type { Id } from "@/convex/_generated/dataModel";


export const removeDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
