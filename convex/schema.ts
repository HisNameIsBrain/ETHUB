import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  voiceSessions: defineTable({
    userId: v.string(),
    status: v.union(v.literal("active"), v.literal("ended")),
    model: v.optional(v.string()),
    device: v.optional(v.string()),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  voiceLogs: defineTable({
    sessionId: v.id("voiceSessions"),
    kind: v.union(v.literal("input"), v.literal("output"), v.literal("event")),
    payloadJson: v.string(),
    createdAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_sessionId_createdAt", ["sessionId", "createdAt"]),

  assistantLogs: defineTable({
    userId: v.optional(v.string()),
    modelUsed: v.optional(v.string()),
    prompt: v.string(),
    answer: v.optional(v.string()),
    ok: v.boolean(),
    status: v.optional(v.number()),
    code: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    createdAt: v.number(),
}),

documents: defineTable({
  title: v.string(),
  content: v.optional(v.string()),
  parentDocument: v.optional(v.id("documents")),
  isPublished: v.optional(v.boolean()),
  isArchived: v.boolean(),
  slug: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  search: v.string(),
})
  .index("by_createdAt", ["createdAt"])
  .index("by_parent", ["parentDocument"])
  .index("by_isPublished", ["isPublished"])
  .index("by_isArchived", ["isArchived"])
  .index("by_slug", ["slug"]),

  users: defineTable({
    userId: v.optional(v.string()),
    tokenIdentifier: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    search: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_tokenIdentifier", ["tokenIdentifier"]),

  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    isPublished: v.optional(v.boolean()),
    isArchived: v.boolean(),
    slug: v.optional(v.string()),
    search: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.string(),                
    coverImage: v.optional(v.string()),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_parent", ["parentDocument"])
    .index("by_isPublished", ["isPublished", "updatedAt"])
    .index("by_isArchived", ["isArchived", "updatedAt"])
    .index("by_slug", ["slug"])
    .index("by_userId", ["userId", "updatedAt"])
    .searchIndex("search_all", { searchField: "search" }),

  services: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    archived: v.optional(v.boolean()),
    createdAt: v.number(),
    search: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_isPublic", ["isPublic"])
    .index("by_createdAt", ["createdAt"])                 
    .index("by_isPublic_archived", ["isPublic", "archived"])
    .searchIndex("search_all", { searchField: "search" }),
});
