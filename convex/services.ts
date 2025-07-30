import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create a new service
export const createService = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    price: v.number(),
    deliveryTime: v.string(),
    orgId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const serviceId = await ctx.db.insert("services", {
      ...args,
      isArchived: false,
      createdAt: Date.now(),
    });
    return serviceId;
  },
});

// Get all services
export const getAllServices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("services")
      .withIndex("by_creation_time")
      .order("desc")
      .collect();
  },
});

// Get services by organization
export const getServicesByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

// Archive a service
export const archiveService = mutation({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.serviceId, { isArchived: true });
  },
});