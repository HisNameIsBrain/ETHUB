import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ------------------------------------------------------------
  // USERS
  // ------------------------------------------------------------
  users: defineTable({
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.string()), // "admin" | "user"
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional( v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"])
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_phoneNumber", ["phoneNumber"])
    .index("by_token", ["tokenIdentifier"]),

  // ------------------------------------------------------------
  // DOCUMENTS
  // ------------------------------------------------------------
  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    isPublished: v.boolean(),
    isArchived: v.boolean(),
    userId: v.string(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.float64()),
  })
    .index("by_organization", ["organizationId"])
    .index("by_parent", ["parentDocument"])
    .index("by_isArchived", ["isArchived"])
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),

  // ------------------------------------------------------------
  // SERVICES
  // ------------------------------------------------------------
  services: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    deliveryTime: v.optional(v.string()),
    isPublic:  v.optional(v.boolean()),
    archived: v.optional(v.boolean()), // ✅ required field
    slug: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    createdBy: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_isPublic_archived", ["isPublic", "archived"])
    .index("by_archived", ["archived"])
    .index("by_createdBy", ["createdBy"]),
});
