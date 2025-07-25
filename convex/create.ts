import { mutation, v } from "../../_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.float(),
    deliveryTime: v.string(),
    serverCode: v.optional(v.string()),
    category: v.string(),
  },
  handler: async ({ db, auth }, args) => {
    const user = await auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const now = Date.now();
    return await db.insert("services", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});