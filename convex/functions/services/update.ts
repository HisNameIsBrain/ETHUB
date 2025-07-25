import { mutation } from "@/convex/_generated/serverd/server";
import { v } from "convex/values";
import type { MutationCtx } from "@/convex/_generated/serverd/server";

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.float()),
    deliveryTime: v.optional(v.string()),
    serverCode: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      id: string;
      name ? : string;
      description ? : string;
      price ? : number;
      deliveryTime ? : string;
      serverCode ? : string;
      category ? : string;
    }
  ) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});