import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  invoices: defineTable({
    ticketId: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    description: v.optional(v.string()),
    quote: v.number(),
    deposit: v.optional(v.string()),
    service: v.string(),
    warrantyAcknowledged: v.boolean(),
    status: v.string(),
    raw: v.optional(v.any()),
    createdAt: v.number(),
  }),

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
    clerkId: v.optional(v.string()), // required Clerk ID link (auth subject)
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    userId: v.optional(v.string()), // external id if needed
    role: v.optional(v.union(v.literal("admin"), v.literal("staff"), v.literal("user"))),
    tokenIdentifier: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_createdAt", ["createdAt"]),

  /* -------------------------------- Jobs --------------------------------- */
  jobs: defineTable({
    userId: v.id("users"),
    deviceModel: v.string(),
    serial: v.optional(v.string()),
    issue: v.string(),
    orderNumber: v.string(),
    status: v.optional(v.string()),
    publicAccessToken: v.optional(v.string()),
    publicAccessTokenExp: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_orderNumber", ["orderNumber"])
    .index("by_createdAt", ["createdAt"]),

  /* ----------------------------- Documents ------------------------------ */
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

  /* ------------------------------ Services ------------------------------ */
  services: defineTable({
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
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
    search: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_isPublic", ["isPublic"])
    .index("by_createdAt", ["createdAt"])
    .searchIndex("search_all", { searchField: "search" }),

  /*---------------------- Client Portal / Events -------------------------*/
  jobEvents: defineTable({
    jobId: v.id("jobs"),
    type: v.string(), // e.g. received | diagnosis_started | parts_ordered | repair_started | qa_started | ready | delivered | note
    message: v.optional(v.string()),
    mediaUrls: v.optional(v.array(v.string())),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_job", ["jobId"])
    .index("by_job_createdAt", ["jobId", "createdAt"]),

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
  })
    .index("by_job", ["jobId"])
    .index("by_job_status", ["jobId", "status"]),
});
