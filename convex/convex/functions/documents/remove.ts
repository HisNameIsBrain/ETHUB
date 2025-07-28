import { mutation } from "convex/server";
import { v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export const remove = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx: MutationCtx, args: { id: Id<"documents"> }) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
