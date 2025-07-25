import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.float(),
    deliveryTime: v.string(),
    serverCode: v.optional(v.string()),
    category: v.string(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      name: string;
      description: string;
      price: number;
      deliveryTime: string;
      serverCode ? : string;
      category: string;
    }
  ) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    
    const now = Date.now();
    return await ctx.db.insert("services", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});