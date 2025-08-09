import { defineSchema, defineTable, v } from "convex/schema";

export default defineSchema({
  users: defineTable({
    userId: v.string(),                       // Clerk subject/id
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    imageUrl: v.optional(v.string()),         // keep consistent: imageUrl (not pictureUrl)
    role: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),  // for by_token index
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_token", ["tokenIdentifier"]),

  // --- keep/extend your other tables below as needed ---
  // Example placeholders (remove if you already have your definitions):
  documents: defineTable({
    content: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    title: v.optional(v.string()),
    isPublished: v.boolean(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  services: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
