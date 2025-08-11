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
      phoneNumber: v.optional(v.string()), // ⬅ add this
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
      organizationId: v.optional(v.string()), // ⬅ add this
      parentDocument: v.optional(v.id("documents")),
      createdAt: v.float64(),
      updatedAt: v.float64(),
    })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),
  
  // ...services unchanged from earlier fix
});
  // ---------- DOCUMENTS ----------
  documents: defineTable({
      title: v.string(),
      content: v.optional(v.string()),
      icon: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      isPublished: v.boolean(),
      isArchived: v.boolean(),
      userId: v.string(), // used by your queries
      parentDocument: v.optional(v.id("documents")), // nesting
      createdAt: v.float64(),
      updatedAt: v.float64(),
    })
    .index("by_user", ["userId"]) // q.eq("userId", ...)
    .index("by_user_parent", ["userId", "parentDocument"]) // q.eq(...).eq(...)
  
  // ---------- SERVICES ----------
  services: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      price: v.optional(v.float64()),
      slug: v.string(),
      isPublic: v.boolean(),
      archived: v.boolean(),
      createdBy: v.string(), // your code reads/compares this
      createdAt: v.float64(),
      updatedAt: v.float64(),
    })
    .index("by_slug", ["slug"]) // q.eq("slug", slug)
    .index("by_isPublic", ["isPublic"]) // q.eq("isPublic", true)