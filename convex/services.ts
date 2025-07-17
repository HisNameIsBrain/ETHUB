import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get a service by ID
export const getServiceById = query({
  args: { id: v.id("services") },
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
    id: v.id("services"),
    name: v.string(),
    description: v.string(),
    price: v.string(),
  },
  handler: async ({ db }, args) => {
    await db.patch(args.id, {
      name: args.name,
      description: args.description,
      price: args.price,
      updatedAt: Date.now(),
    });
  },
});

// Delete a service
export const deleteService = mutation({
  args: { id: v.id("services") },
  handler: async ({ db }, { id }) => {
    await db.delete(id);
  },
});

// List all services
export const listAllServices = query({
  handler: async ({ db }) => {
    return await db.query("services").collect();
  },
});
