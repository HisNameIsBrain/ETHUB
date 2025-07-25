import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
  handler: async ({ db, auth }, args: {
    id: string,
    name ? : string,
    description ? : string,
    price ? : number,
    deliveryTime ? : string,
    serverCode ? : string,
    category ? : string,
  }) => {
    const user = await auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    
    const { id, ...updates } = args;
    return await db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});