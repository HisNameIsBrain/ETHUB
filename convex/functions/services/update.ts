import { mutation, v } from "../../_generated/server";

export const update = mutation({
  args: {
    serviceId: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.float()),
    deliveryTime: v.optional(v.string()),
    serverCode: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async ({ db, auth }, args) => {
    const user = await auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const { serviceId, ...updates } = args;

    return await db.patch(serviceId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});