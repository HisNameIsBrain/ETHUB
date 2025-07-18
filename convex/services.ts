import { query } from "convex/server";
import { v } from "convex/values";
import { services } from "./_generated/dataModel"; // Adjust import if needed

export const getPublicServices = query({
  args: {},
  handler: async ({ db }) => {
    return await db.query("services").collect();
  },
});
// convex/services.ts
export const getServiceById = query({
  args: {
    id: v.id("services"),
  },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});
// Create a new service
export const createService = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.string(),
    deliveryTime: v.string(),
  },
  handler: async ({ db }, args) => {
    return await db.insert("services", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Update an existing service
export const updateService = mutation({
  args: {
    serviceId: v.id("services"),
    name: v.string(),
    description: v.string(),
    price: v.string(),
    deliveryTime: v.string(),
  },
  handler: async ({ db }, args) => {
    await db.patch(args.serviceId, {
      name: args.name,
      description: args.description,
      price: args.price,
      deliveryTime: args.deliveryTime,
      updatedAt: Date.now(),
    });
  },
});

// Delete a service
export const deleteService = mutation({
  args: { serviceId: v.id("services") },
  handler: async ({ db }, { serviceId }) => {
    await db.delete(serviceId);
  },
});

// List all services
export const listAllServices = query({
  handler: async (ctx) => {
    return await ctx.db.query("services").collect();
  },
});

