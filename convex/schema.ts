// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
      userId: v.string(),
      tokenIdentifier: v.string(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      pictureUrl: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      username: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
      createdAt: v.float64(),
      updatedAt: v.optional(v.float64()),
    })
    .index("by_token", ["tokenIdentifier"])
    .index("by_userId", ["userId"]),
  
  documents: defineTable({
      title: v.string(),
      content: v.optional(v.string()),
      icon: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      isPublished: v.boolean(),
      isArchived: v.boolean(),
      userId: v.string(),
      organizationId: v.optional(v.string()),
      parentDocument: v.optional(v.id("documents")),
      createdAt: v.float64(),
      updatedAt: v.float64(),
      deliveryTime: v.optional(""),
      name: v.string(),
      price: v.optional("")
    })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),

  services: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      price: v.optional(v.float64()),
      deliveryTime: v.optional(v.string()),
      
      // REQUIRED fields
      slug: v.string(),
      createdAt: v.float64(),
      updatedAt: v.float64(),
      isPublic: v.boolean(),
      archived: v.boolean(),
      createdBy: v.string(),
    })
    .index("by_slug", ["slug"])
    .index("by_createdBy", ["createdBy"]),
  // ...other tables
});