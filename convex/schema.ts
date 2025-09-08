import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    userId: v.string(),
    isArchived: v.boolean(),
    isPublished: v.optional(v.boolean()),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_parent", ["parentDocument"])
    .index("by_isArchived", ["isArchived"]),

  services: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),            // if you used v.float64, keep schema in sync
    deliveryTime: v.optional(v.string()),
    isPublic: v.boolean(),
    archived: v.boolean(),
    slug: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_archived", ["archived"])
    .index("by_isPublic_archived", ["isPublic", "archived"]),

  users: defineTable({
    userId: v.string(),
    role: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_token", ["tokenIdentifier"]),
});
