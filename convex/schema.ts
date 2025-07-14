import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    userId: v.string(),
    orgId: v.string(),
    parentDocument: v.optional(v.id("documents")),
    isArchived: v.boolean(),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  services: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.string(),
    deliveryTime: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_creation_time", ["createdAt"]),

  servicePermissions: defineTable({
    userId: v.string(),
    serviceId: v.id("services"),
    role: v.union(
      v.literal("viewer"),
      v.literal("editor"),
      v.literal("admin")
    ),
  }).index("by_service", ["serviceId"]),
});
