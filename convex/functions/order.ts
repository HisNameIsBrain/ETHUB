import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
    serviceId: v.id("services"),
    imei: v.string(),
    deviceModel: v.string(),
  },
  handler: async ({ db, auth }, args) => {
    const user = await auth.getUserIdentity();

    await db.insert("orders", {
      serviceId: args.serviceId,
      imei: args.imei,
      deviceModel: args.deviceModel,
      customerId: user?.subject ?? null,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});