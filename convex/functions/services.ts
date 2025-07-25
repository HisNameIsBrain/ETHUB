import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async ({ db }) => {
    return await db.query("services").collect();
  },
});

export const getById = query({
  args: {
    serviceId: v.id("services"),
  },
  handler: async ({ db }, { serviceId }) => {
    return await db.get(serviceId);
  },
});

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

export const remove = mutation({
  args: {
    serviceId: v.id("services"),
  },
  handler: async ({ db, auth }, { serviceId }) => {
    const user = await auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    await db.delete(serviceId);
    return { success: true };
  },
});