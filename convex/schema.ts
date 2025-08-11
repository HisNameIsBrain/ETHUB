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
  }).index("by_userId", ["userId"]).index("by_token", ["tokenIdentifier"]),

  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isArchived: v.boolean(),
    isPublished: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    organizationId: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.float64(),
    updatedAt: v.float64(),
  }).index("by_userId", ["userId"])
});
