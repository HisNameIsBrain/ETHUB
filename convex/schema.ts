import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /* -------------------------- Voice telemetry -------------------------- */
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

  /* ------------------------------- Users -------------------------------- */
  users: defineTable({
    email: v.optional(v.string()),                    // required per your latest file
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    createdAt: v.float64(),
    updatedAt: v.float64(),
    imageUrl: v.optional(v.string()),
    userId: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    tokenIdentifier: v.optional(v.string()),
    clerkId: v.string(),   // or auth provider subject
  })
   .index("by_clerkId", ["clerkId"]),

  jobs: defineTable({
    userId: v.id("users"),
    deviceModel: v.string(),
    issue: v.string(),
    orderNumber: v.string(),
    status: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_orderNumber", ["orderNumber"]),
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_createdAt", ["createdAt"]),

  /* ----------------------------- Documents ------------------------------ */
  documents: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    isArchived: v.boolean(),
    isPublished: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),                // make required for consistency
    updatedAt: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_parent", ["parentDocument"])
    .index("by_isArchived", ["isArchived"]),

  /* ------------------------------ Services ------------------------------ */
  services: defineTable({
    slug: v.optional(v.string()),         // some code treats it optional on insert
    title: v.optional(v.string()),
    description: v.optional(v.string()),  // legacy alias for notes; safe to keep
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    deliveryTime: v.optional(v.string()),
    priceCents: v.optional(v.number()),
    currency: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    isPublic: v.boolean(),
    archived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    search: v.optional(v.string()),       // flattened text blob (for search index)
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_isPublic", ["isPublic"])
    .index("by_createdAt", ["createdAt"])
    .searchIndex("search_all", { searchField: "search" }),

/*---------------------- Client Portal  -----------------------------*/

  jobEvents: defineTable({
    jobId: v.id("jobs"),
    type: v.string(), // received | diagnosis_done | parts_ordered | parts_arrived | repair_started | repair_done | qa_passed | ready | delivered | note
    message: v.optional(v.string()),
    mediaUrls: v.optional(v.array(v.string())),
    createdBy: v.string(),
    createdAt: v.number(),
  }).index("by_job", ["jobId"]).index("by_job_createdAt", ["jobId", "createdAt"]),

  partsOrders: defineTable({
    jobId: v.id("jobs"),
    vendor: v.string(),
    partNumber: v.string(),
    qty: v.number(),
    eta: v.optional(v.number()),
    cost: v.optional(v.number()),
    status: v.string(), // ordered | backordered | arrived | used | canceled
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_job", ["jobId"]).index("by_job_status", ["jobId", "status"]),
});


