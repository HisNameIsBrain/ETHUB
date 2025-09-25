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

  users: defineTable({
    email: v.string(),            // NOT NULL
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])         // unique in logic (enforced in mutations)
    .index("by_username", ["username"])   // optional unique
    .index("by_createdAt", ["createdAt"]),
  }),

  documents: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    isArchived: v.boolean(),
    isPublished: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_parent", ["parentDocument"])
    .index("by_isArchived", ["isArchived"]),

  services: defineTable({
    id: v.optional(v.strings())
    slug: v.optional(v.string()),       
    title: v.optional(v.string()),        
    description: v.optional(v.string()),
    category: v.optional(v.string()),     
    deliveryTime: v.optional(v.string()),  
    priceCents: v.optional(v.number()),  
    currency: v.optional(v.string()),       
    sourceUrl: v.optional(v.string()),    
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.boolean(),
    archived: v.boolean(),
    search: v.optional(v.string()),
  })
    .searchIndex("search_all", { searchField: "search" })
    .index("by_slug", ["slug"])
    .index("by_category", ["category", "archived"])
    .index("by_isPublic", ["isPublic", "archived"])
});
