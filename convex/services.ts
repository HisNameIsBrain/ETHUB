import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Create a new service
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const createdBy = identity.subject;
    
    return await ctx.db.insert("services", {
      name: args.name,
      description: args.description,
      price: args.price,
      createdBy,
      isArchived: false,
    });
  },
});

// Get all active services for the current user
export const getAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const userId = identity.subject;
    
    return await ctx.db
      .query("services")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
  },
});

// Archive (soft-delete) a service
export const archive = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const userId = identity.subject;
    const service = await ctx.db.get(args.id);
    if (!service) throw new Error("Service not found");
    if (service.createdBy !== userId) throw new Error("Not authorized");
    
    return await ctx.db.patch(args.id, { isArchived: true });
  },
});

// Restore a previously archived service
export const restore = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const userId = identity.subject;
    const service = await ctx.db.get(args.id);
    if (!service) throw new Error("Service not found");
    if (service.createdBy !== userId) throw new Error("Not authorized");
    
    return await ctx.db.patch(args.id, { isArchived: false });
  },
});

// Get all archived (trashed) services
export const getTrash = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const userId = identity.subject;
    
    return await ctx.db
      .query("services")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();
  },
});

// Delete a service permanently
export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const userId = identity.subject;
    const service = await ctx.db.get(args.id);
    if (!service) throw new Error("Service not found");
    if (service.createdBy !== userId) throw new Error("Not authorized");
    
    return await ctx.db.delete(args.id);
  },
});

// Update a service
export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const userId = identity.subject;
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Service not found");
    if (existing.createdBy !== userId) throw new Error("Unauthorized");
    
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Get a service by ID (with access control)
export const getById = query({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const service = await ctx.db.get(args.id);
    
    if (!service) throw new Error("Service not found");
    if (service.isArchived) throw new Error("Service is archived");
    
    if (service.createdBy === identity?.subject) {
      return service;
    }
    
    throw new Error("Not authorized");
  },
});