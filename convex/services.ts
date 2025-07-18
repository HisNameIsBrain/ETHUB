import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get a service by ID
export const getServiceById = query({
  args: { serviceId: v.id("services") },
  handler: async ({ db }, { serviceId }) => {
    return await db.get(serviceId);
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

