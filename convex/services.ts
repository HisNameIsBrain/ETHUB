// convex/services.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Create a new service
export const createService = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    deliveryTime: v.string(),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    orgId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    try {
      const serviceId = await ctx.db.insert("services", {
        ...args,
        isArchived: false,
      });
      
      return serviceId;
    } catch (error) {
      console.error("Failed to create service:", error);
      throw new Error("Service creation failed");
    }
  },
});

// Get one service by ID
export const getServiceById = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.serviceId);
  },
});

// Get all services by organization
export const getServicesByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});