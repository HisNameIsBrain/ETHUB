// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // --- Inventory parts (stocked items) ---
  inventoryParts: defineTable({
    name: v.string(),                         // e.g. "iPhone 12 Battery"
    device: v.optional(v.string()),           // from metadata.device if present
    category: v.optional(v.string()),         // from metadata.category
    compatibleModels: v.optional(v.array(v.string())),
    condition: v.optional(v.string()),        // "OEM", "Premium", etc.
    cost: v.optional(v.number()),             // internal cost
    price: v.optional(v.number()),            // retail price
    currency: v.optional(v.string()),         // "USD"
    sku: v.optional(v.string()),
    vendor: v.optional(v.string()),
    vendorSku: v.optional(v.string()),
    stock: v.optional(v.number()),            // stock qty
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

  // --- Parts docs coming from assistant / vendor lookups ---
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
});
