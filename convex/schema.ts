import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
    .index("by_user_parent", ["userId", "parentDocument"])
    .index("by_user_title", ["userId", "title"]),
  
  users: defineTable({
      email: v.string(), // required
      name: v.optional(v.string()), // optional
      username: v.optional(v.string()), // optional
    })
    .index("by_email", ["email"])
    .index("by_username", ["username"]),
  
  services: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    deliveryTime: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
  // Add indexes if you'll query by these fields frequently:
  // .index("by_name", ["name"])
  // .index("by_createdAt", ["createdAt"])
});