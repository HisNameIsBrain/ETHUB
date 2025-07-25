import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 📄 Document System
  documents: defineTable({
      title: v.string(),
      content: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      icon: v.optional(v.string()),
      userId: v.string(),
      orgId: v.string(),
      parentDocument: v.optional(v.id("documents")),
      isArchived: v.boolean(),
      isPublished: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_user_parent", ["userId", "parentDocument"]),
  
  permissions: defineTable({
      documentId: v.id("documents"),
      userId: v.string(),
      role: v.union(
        v.literal("viewer"),
        v.literal("editor"),
        v.literal("admin")
      ),
    })
    .index("by_user", ["userId"])
    .index("by_document", ["documentId"]),
  
  // ✅ Public-Facing IMEI Service System
  services: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.float(),
    deliveryTime: v.string(),
    serverCode: v.optional(v.string()), // External API hook
    category: v.string(),
  }),
  
  orders: defineTable({
      serviceId: v.id("services"),
      imei: v.string(),
      deviceModel: v.string(),
      customerId: v.optional(v.string()),
      status: v.string(), // "pending", "in_progress", "done"
      createdAt: v.number(),
    })
    .index("by_service", ["serviceId"])
    .index("by_customer", ["customerId"]),
});