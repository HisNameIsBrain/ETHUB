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
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()), // 👈 Add this line
    isArchived: v.boolean(),
    isPublished: v.optional(v.boolean()),
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
    userId: v.string(),
    serviceId: v.id("services"),
    imei: v.string(),
    serial: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(), // timestamp (Date.now())
  }).index("by_user", ["userId"]),
  
});