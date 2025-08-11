// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  services: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      price: v.optional(v.float64()),
      deliveryTime: v.optional(v.string()), // <-- add this line
      slug: v.string(),
      isPublic: v.boolean(),
      archived: v.boolean(),
      createdAt: v.float64(),
      updatedAt: v.float64(),
      createdBy: v.string(),
    })
    .index("by_slug", ["slug"])
    .index("by_isPublic", ["isPublic"])
    .index("by_createdBy", ["createdBy"]),
});