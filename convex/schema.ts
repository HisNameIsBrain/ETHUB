// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /** ---------------------------------------------------------
   * Users table
   * Stores all authenticated users, roles for admin gating
   * --------------------------------------------------------*/
  users: defineTable({
      userId: v.string(), // Clerk/other provider subject
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      role: v.optional(v.string()), // "admin" | "user"
      createdAt: v.number(),
    })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"]),
  
  /** ---------------------------------------------------------
   * Services table
   * Used for your services marketplace
   * --------------------------------------------------------*/
  services: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      price: v.optional(v.number()),
      isPublic: v.boolean(),
      archived: v.boolean(),
      slug: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      createdBy: v.string(), // userId of creator
    })
    // indexes used in services.ts
    .index("by_slug", ["slug"])
    .index("by_isPublic_archived", ["isPublic", "archived"])
    .index("by_archived", ["archived"])
    .index("by_createdBy", ["createdBy"]),
  
  /** ---------------------------------------------------------
   * Documents table (kept from your original app)
   * --------------------------------------------------------*/
  documents: defineTable({
      title: v.string(),
      content: v.optional(v.string()),
      isPublished: v.boolean(),
      isArchived: v.boolean(),
      organizationId: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      icon: v.optional(v.string()),
      parentDocument: v.optional(v.id("documents")),
      createdAt: v.number(),
      updatedAt: v.number(),
      createdBy: v.string(),
    })
    .index("by_organization", ["organizationId"])
    .index("by_parent", ["parentDocument"])
    .index("by_isArchived", ["isArchived"])
    .index("by_createdBy", ["createdBy"]),
});