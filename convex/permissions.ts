import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation to add permission for a user to a specific service
export const addPermission = mutation({
  args: {
    serviceId: v.id("services"),
    userId: v.string(), // Clerk user ID of the invited user
    role: v.union(
      v.literal("viewer"),
      v.literal("editor"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    // Optional: Check if current user owns the service
    const service = await ctx.db.get(args.serviceId);
    if (!service || service.userId !== identity.subject) {
      throw new Error("You don't have permission to share this service.");
    }
    
    return await ctx.db.insert("permissions", args);
  },
});

// Query to get all permissions assigned to a specific user
export const getPermissionsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("permissions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Query to get all users who have permissions for a specific service
export const getPermissionsByService = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("permissions")
      .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId))
      .collect();
  },
});