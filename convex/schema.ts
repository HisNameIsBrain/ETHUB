// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
      tokenIdentifier: v.string(),
      name: v.string(),
      email: v.optional(v.string()),
      image: v.optional(v.string()),
    })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),
  
  organizations: defineTable({
    name: v.string(),
    createdBy: v.string(),
  }),
  
  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()), // <-- make it optional
    coverImage: v.optional(v.string()),
    isArchived: v.boolean(),
    isPublished: v.optional(v.boolean()), // <- add if used
    parentDocument: v.optional(v.id("documents")),
    orgId: v.optional(v.id("organizations")),
    userId: v.string(),
  })
  .index("by_org", ["orgId"])
  .index("by_user", ["userId"]),
  
  services: defineTable({
      name: v.string(),
      price: v.number(),
      deliveryTime: v.string(),
      description: v.optional(v.string()),
      type: v.optional(v.string()),
      orgId: v.optional(v.id("organizations")),
      isArchived: v.optional(v.boolean()),
    })
    .index("by_org", ["orgId"]),
  
  orders: defineTable({
      serviceId: v.id("services"),
      userId: v.string(),
      imei: v.string(),
      serial: v.optional(v.string()),
      status: v.string(), // pending, processing, completed
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
    .index("by_user", ["userId"])
    .index("by_service", ["serviceId"]),
});