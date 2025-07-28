import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";

export const remove = mutation({
  args: {
    id: v.id("services"),
  },
  handler: async (ctx: MutationCtx, args: { id: string }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    
    await ctx.db.delete(args.id);
    
    return { success: true };
  },
});