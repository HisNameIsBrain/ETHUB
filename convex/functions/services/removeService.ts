import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const removeService = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
