import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
      title: v.string(),
      userId: v.string(),
      isArchived: v.boolean(),
      parentDocument: v.optional(v.id("documents")),
      content: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      icon: v.optional(v.string()),
      isPublished: v.boolean(),
    })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),
  
  services: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    createdBy: v.string(),
    isArchived: v.boolean(), // ✅ Add this
  })
  .index("by_creator", ["createdBy"]),
  
orders: defineTable({
    serviceId: v.id("services"),
    userId: v.string(),
    imei: v.string(),
    serialNumber: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    notes: v.optional(v.string()),
    isArchived: v.boolean(), // ✅ Add this
  })
  .index("by_user", ["userId"])
  .index("by_user_status", ["userId", "status"]),
});