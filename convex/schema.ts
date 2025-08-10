// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
 // ------------------------------------------------------------
 // USERS (example — keep whatever you already have)
 // ------------------------------------------------------------
 users: defineTable({
   userId: v.string(),
   role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
   tokenIdentifier: v.string(),
   name: v.optional(v.string()),
   email: v.optional(v.string()),
   pictureUrl: v.optional(v.string()),
   createdAt: v.float64(),
  })
  .index("by_userId", ["userId"])
  .index("by_token", ["tokenIdentifier"]),
 
 // ------------------------------------------------------------
 // SERVICES
 // ------------------------------------------------------------
 services: defineTable({
   name: v.string(),
   description: v.optional(v.string()),
   price: v.optional(v.number()),
   createdAt: v.float64(),
   updatedAt: v.float64(),
   isPublic: v.boolean(),
   archived: v.boolean(),
   slug: v.string(),
   createdBy: v.string(), // <— THIS fixes the schema/type errors
  })
  .index("by_slug", ["slug"])
  .index("by_createdBy", ["createdBy"])
  .index("by_isPublic", ["isPublic"]) // handy for listing
});