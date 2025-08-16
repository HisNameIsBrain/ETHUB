// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ---------- USERS ----------
  users: defineTable({
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    name: v.string(),              // required -> ensure you pass a string
    email: v.string(),             // required -> ensure you pass a string
    imageUrl: v.string(),          // required -> allow "" when unknown
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    // needed by users.ts
    .index("by_token", ["tokenIdentifier"]),

  // ---------- DOCUMENTS ----------

documents: defineTable({
  title: v.string(),
  content: v.optional(v.string()),
  coverImage: v.optional(v.string()),
  icon: v.optional(v.string()),
  isArchived: v.boolean(),
  isPublished: v.boolean(),
  organizationId: v.optional(v.string()),
  parentDocument: v.optional(v.id("documents")),
  userId: v.string(),
  createdAt: v.float64(),
  updatedAt: v.float64(),
})
  .index("by_userId", ["userId"])
  .index("by_parent", ["parentDocument"])
  .index("by_isArchived", ["isArchived"]),
  // ---------- SERVICES ----------
  services: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.float64()),
    deliveryTime: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
    slug: v.optional(v.string()),
    createdAt: v.optional(v.float64()),
    updatedAt: v.optional(v.float64()),
  })
    .index("by_slug", ["slug"])
    .index("by_isPublic", ["isPublic"])
    .index("by_archived", ["archived"]),
});
