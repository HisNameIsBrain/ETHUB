import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Public: Get all available records
 */
export const getAll = query({
  handler: async ({ db }) => {
    return await db.query("services").collect();
  },
});

/**
 * Public: Get record by ID
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
 * Admin-only: Create a new record
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
    
    return await db.insert("services", args);
  },
});

/**
 * Admin-only: Update existing record
 */
export const update = mutation({
  args: {
    serviceId: v.id("services"),
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
    
    const { serviceId, ...updates } = args;
    await db.patch(serviceId, updates);
  },
});

/**
 * Admin-only: Delete a record
 */
export const remove = mutation({
  args: {
    serviceId: v.id("services"),
  },
  handler: async ({ db, auth }, { serviceId }) => {
    const user = await auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    
    await db.delete(serviceId);
  },
});