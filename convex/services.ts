import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get a single service by ID
export const getServiceById = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");
    return service;
  },
});

// Create a new service
export const createService = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.string(), // Clerk ID
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("services", {
      name: args.name,
      description: args.description ?? "",
      userId: args.userId,
      orgId: args.orgId,
      createdAt: Date.now(),
    });
  },
});

// Delete a service
export const deleteService = mutation({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.serviceId);
  },
});