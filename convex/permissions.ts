import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const assignPermission = mutation({
  args: {
    userId: v.string(),
    serviceId: v.id("services"),
    role: v.union(
      v.literal("viewer"),
      v.literal("editor"),
      v.literal("admin")
    ),
  },
  handler: async ({ db }, args) => {
    return await db.insert("servicePermissions", args);
  },
});

export const getServicePermissions = query({
  args: { serviceId: v.id("services") },
  handler: async ({ db }, { serviceId }) => {
    return await db
      .query("servicePermissions")
      .withIndex("by_service", (q) => q.eq("serviceId", serviceId))
      .collect();
  },
});

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// Assign a permission to a user for a specific service
export const assignPermission = mutation({
  args: {
    userId: v.string(),
    serviceId: v.id("services"),
    role: v.union(
      v.literal("viewer"),
      v.literal("editor"),
      v.literal("admin")
    ),
  },
  handler: async ({ db }, args) => {
    return await db.insert("servicePermissions", args);
  },
});

// Retrieve all permissions for a specific service
export const getServicePermissions = query({
  args: { serviceId: v.id("services") },
  handler: async ({ db }, { serviceId }) => {
    return await db
      .query("servicePermissions")
      .withIndex("by_service", (q) => q.eq("serviceId", serviceId))
      .collect();
  },
});