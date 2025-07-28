import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const removeDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
