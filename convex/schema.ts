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
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_parent", ["parentDocument"])
    .index("by_isArchived", ["isArchived"]),

  services: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),                  // ✅ keep required price:number
    isPublic: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    button: v.optional(
      v.object({
        label: v.string(),
        href: v.string(),
        variant: v.optional(
          v.union(
            v.literal("default"),
            v.literal("secondary"),
            v.literal("outline"),
            v.literal("ghost")
          )
        ),
      })
    ),

    slug: v.optional(v.string()),
    deliveryTime: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    archived: v.optional(v.boolean()),
  })
    .index("by_public", ["isPublic"])
    .index("by_sortOrder", ["sortOrder"])
    .index("by_createdAt", ["createdAt"])
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
