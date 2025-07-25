import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Public: Get all services
 */
export const getAll = query({
  handler: async ({ db }) => {
    return await db.query("services").collect();
  },
});

/**
 * Public: Get service by ID
 */
export const getById = query({
  args: {
    serviceId: v.id("services"),
  },
  handler: async ({ db }, { serviceId }) => {
    return await db.get(serviceId);
  },
});

/**
 * Admin-only: Create a new service
 */
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

/**
 * Admin-only: Update existing service
 */
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
    
    // Add updatedAt timestamp
    const patched = await db.patch(serviceId, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    return patched;
  },
});

/**
 * Admin-only: Delete a service
 */
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