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
   role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
   createdAt: v.float64(),
  })
  .index("by_token", ["tokenIdentifier"])
  .index("by_userId", ["userId"]),
 
 services: defineTable({
   name: v.string(),
   description: v.optional(v.string()),
   price: v.optional(v.number()),
   slug: v.string(),
   isPublic: v.boolean(),
   archived: v.boolean(),
   createdBy: v.string(),
   createdAt: v.float64(),
   updatedAt: v.float64(),
  })
  .index("by_slug", ["slug"])
  .index("by_userId", ["createdBy"]),
 
 documents: defineTable({
   userId: v.string(),
   title: v.string(),
   content: v.optional(v.string()),
   icon: v.optional(v.string()),
   coverImage: v.optional(v.string()),
   parentDocument: v.optional(v.id("documents")),
   isArchived: v.boolean(),
   isPublished: v.boolean(),
   organizationId: v.optional(v.string()),
   createdAt: v.float64(),
   updatedAt: v.float64(),
  })
  .index("by_user", ["userId"])
  .index("by_user_parent", ["userId", "parentDocument"])
  .index("by_parent", ["parentDocument"]),
});