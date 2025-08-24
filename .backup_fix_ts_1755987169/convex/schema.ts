// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // USERS
  users: defineTable({
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.string()), // "admin" | "user"
    username: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  // DOCUMENTS (notes)
  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    userId: v.string(),
    parentDocument: v.optional(v.id("documents")),
    isArchived: v.boolean(),
    createdAt: v.number(), // Date.now()
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_parent", ["parentDocument"])
    .index("by_isArchived", ["isArchived"]),

  // SERVICES (public directory)
  services: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    isPublic: v.boolean(),
    archived: v.boolean(),
    slug: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_isPublic_archived", ["isPublic", "archived"])
    .index("by_archived", ["archived"])
    .index("by_createdBy", ["createdBy"]),
});
