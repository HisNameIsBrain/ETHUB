// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
   documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    userId: v.string(),

    parentDocument: v.optional(v.id("documents")),
    isArchived: v.optional(v.boolean()),

    templateId: v.optional(v.id("templates")),
    propertySchemaId: v.optional(v.id("propertySchemas")),
    properties: v.optional(v.record(v.string(), v.any())),

    coverImage: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),

    isPublished: v.optional(v.boolean()),
  })
    .index("by_parent", ["parentDocument"])
    .index("by_user", ["userId"])
    .index("by_updatedAt", ["updatedAt"]),

  propertySchemas: defineTable({
    name: v.string(),
    userId: v.string(),
    fields: v.array(
      v.object({
        key: v.string(),
        name: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("number"),
          v.literal("select"),
          v.literal("multi_select"),
          v.literal("checkbox"),
          v.literal("date"),
          v.literal("url"),
          v.literal("files"),
          v.literal("relation")
        ),
        options: v.optional(
          v.array(
            v.object({
              id: v.string(),
              name: v.string(),
              color: v.optional(v.string()),
            })
          )
        ),
        relation: v.optional(
          v.object({
            table: v.literal("documents"),
          })
        ),
        required: v.optional(v.boolean()),
      })
    ),
  }).index("by_user", ["userId"]),

  templates: defineTable({
    name: v.string(),
    userId: v.string(),
    description: v.optional(v.string()),
    contentTemplate: v.optional(v.string()),
    propertySchemaId: v.optional(v.id("propertySchemas")),
    defaultProperties: v.optional(v.record(v.string(), v.any())),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // --- Inventory parts (stocked items) ---
  inventoryParts: defineTable({
    name: v.string(), 
    device: v.optional(v.string()),
    category: v.optional(v.string()),
    compatibleModels: v.optional(v.array(v.string())),
    condition: v.optional(v.string()),
    cost: v.optional(v.number()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    sku: v.optional(v.string()),
    vendor: v.optional(v.string()),
    vendorSku: v.optional(v.string()),
    stock: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(
      v.object({
        category: v.optional(v.string()),
        device: v.optional(v.string()),
        notes: v.optional(v.string()),
        originalCondition: v.optional(v.string()),
        partNumber: v.optional(v.string()),
        source: v.optional(v.string()),
        vendorSku: v.optional(v.string()),
      })
    ),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_sku", ["sku"])
    .index("by_device", ["device"])
    .index("by_category", ["category"])
    .index("by_createdAt", ["createdAt"])
    .index("by_updatedAt", ["updatedAt"]),

  parts: defineTable({
    parts: v.optional(
      v.array(
        v.object({
          query: v.optional(v.string()),
          title: v.string(),
          device: v.optional(v.string()),
          partPrice: v.optional(v.number()),
          labor: v.optional(v.number()),
          total: v.optional(v.number()),
          type: v.optional(v.string()),
          eta: v.optional(v.string()),
          image: v.optional(v.string()),
          source: v.optional(v.string()),
          createdAt: v.optional(v.number()),
          updatedAt: v.number(),
        })
      )
    ),
    images: v.optional(
      v.array(
        v.object({
          url: v.optional(v.string()),
          title: v.optional(v.string()),
          link: v.optional(v.string()),
          mime: v.optional(v.string()),
          thumbnail: v.optional(v.string()),
          contextLink: v.optional(v.string()),
          alt: v.optional(v.string()),
        })
      )
    ),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_createdAt", ["createdAt"]),

  // =============================== INTAKE DRAFTS ====================================
  intakeDrafts: defineTable({
    customerName: v.string(),
    contact: v.object({
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      preferred: v.optional(
        v.union(v.literal("phone"), v.literal("email"))
      ),
    }),
    deviceModel: v.string(),
    issueDescription: v.string(),
    requestedService: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("submitted"),
        v.literal("cancelled")
      )
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  // ================================== INVOICES ======================================
  invoices: defineTable({
    ticketId: v.string(),
    name: v.union(v.string(), v.null()),
    email: v.union(v.string(), v.null()),
    phone: v.union(v.string(), v.null()),
    manufacturer: v.union(v.string(), v.null()),
    description: v.string(),
    quote: v.union(v.number(), v.null()),
    deposit: v.string(),
    service: v.string(),
    warrantyAcknowledged: v.boolean(),
    raw: v.any(),
    status: v.string(),
    createdAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  // ==================================== USERS ======================================
  users: defineTable({
    clerkId: v.optional(v.string()),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    userId: v.optional(v.string()),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("staff"), v.literal("user"))
    ),
    tokenIdentifier: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_createdAt", ["createdAt"]),

  // ===================================== JOBS ======================================
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
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  jobEvents: defineTable({
    jobId: v.id("jobs"),
    type: v.string(),
    message: v.optional(v.string()),
    mediaUrls: v.optional(v.array(v.string())),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_job", ["jobId"])
    .index("by_job_createdAt", ["jobId", "createdAt"]),

  // ================================== SERVICES =====================================
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

  // ========================= MINECRAFT / eREALMS TABLES ============================
mcTimelineEvents: defineTable({
  userId: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  body: v.optional(v.string()),        // ← add this to match existing docs
  year: v.optional(v.string()),
  dateLabel: v.optional(v.string()),
  kind: v.optional(v.string()),
  icon: v.optional(v.string()),
  link: v.optional(v.string()),
  sortIndex: v.optional(v.number()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
}).index("by_user", ["userId"]),

mcServerPlans: defineTable({
  slug: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  monthlyPriceUsd: v.optional(v.number()), // your field
  currency: v.optional(v.string()),        // now optional
  isFeatured: v.optional(v.boolean()),
  shortTag: v.optional(v.string()),
  specs: v.optional(v.string()),
  maxPlayers: v.optional(v.number()),
  ramGb: v.optional(v.number()),
  storageGb: v.optional(v.number()),
  features: v.optional(v.array(v.string())),
  isPublic: v.optional(v.boolean()),
  sortIndex: v.optional(v.number()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
})
  .index("by_slug", ["slug"])
  .index("by_isPublic", ["isPublic"])
  .index("by_isFeatured", ["isFeatured"]),

  mcJourneys: defineTable({
    userId: v.string(),
    slug: v.string(),
    title: v.string(),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    year: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"])
    .index("by_published", ["isPublished", "sortIndex"]),

mcButtons: defineTable({
  key: v.optional(v.string()),       // e.g. "erealms_back_to_journal"
  label: v.string(),
  group: v.optional(v.string()),     // make optional to match args
  href: v.optional(v.string()),
  icon: v.optional(v.string()),
  description: v.optional(v.string()),
  variant: v.optional(v.string()),   // e.g. "ghost"
  sortIndex: v.optional(v.number()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
})
  .index("by_group", ["group"]),

mcButtonClicks: defineTable({
  buttonKey: v.string(), // string key like "erealms_back_to_journal"
  userId: v.optional(v.string()),
  path: v.optional(v.string()),      // route where click happened
  sessionId: v.optional(v.string()), // optional tracking id
  metadata: v.optional(v.record(v.string(), v.any())),
  createdAt: v.number(),
})
  .index("by_buttonKey", ["buttonKey"])
  .index("by_user", ["userId"])
  .index("by_createdAt", ["createdAt"]),

  // =========================== VOICE & AI TELEMETRY ================================
  voiceSessions: defineTable({
    userId: v.string(),
    status: v.union(v.literal("active"), v.literal("ended")),
    model: v.optional(v.string()),
    device: v.optional(v.string()),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"]),

  voiceLogs: defineTable({
    sessionId: v.id("voiceSessions"),
    kind: v.union(
      v.literal("input"),
      v.literal("output"),
      v.literal("event")
    ),
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
  })
    .index("by_userId", ["userId"])
    .index("by_ok", ["ok"])
    .index("by_createdAt", ["createdAt"]),
});
