import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
    serviceId: v.id("services"),
    imei: v.string(),
    deviceModel: v.string(),
    customerId: v.optional(v.string()),
  },
  handler: async ({ db }, args) => {
    return await db.insert("orders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const getOrdersByCustomer = query({
  args: { customerId: v.string() },
  handler: async ({ db }, { customerId }) => {
    return await db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", customerId))
      .collect();
  },
});

export const getOrdersByService = query({
  args: { serviceId: v.id("services") },
  handler: async ({ db }, { serviceId }) => {
    return await db
      .query("orders")
      .withIndex("by_service", (q) => q.eq("serviceId", serviceId))
      .collect();
  },
});