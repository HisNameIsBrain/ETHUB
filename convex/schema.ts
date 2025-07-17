import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Documents table (Notion-like structure)
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),

  // Services table (used by getServiceById, createService, etc.)
  services: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.string(),
    deliveryTime: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
});
