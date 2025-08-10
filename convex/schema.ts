// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
 // ------------------------------------------------------------
 // USERS
 // Matches usage in ensure-user.tsx and users.tsx
 // ------------------------------------------------------------
 users: defineTable({
   userId: v.string(), // auth subject (Clerk, etc.)
   name: v.optional(v.string()),
   email: v.optional(v.string()),
   imageUrl: v.optional(v.string()),
   role: v.optional(v.string()), // "admin" | "user"
   username: v.optional(v.string()),
   phoneNumber: v.optional(v.string()),
   tokenIdentifier: v.optional(v.string()),
   createdAt: v.number(),
   updatedAt: v.number(), // <-- added to keep insert/patch consistent
  })
  .index("by_userId", ["userId"])
  .index("by_role", ["role"])
  .index("by_email", ["email"])
  .index("by_username", ["username"])
  .index("by_phoneNumber", ["phoneNumber"])
  .index("by_token", ["tokenIdentifier"]), // <-- belongs on users
 
 // ------------------------------------------------------------
 // DOCUMENTS (Notion-like)
 // Matches documents.ts which expects userId & custom indexes
 // ------------------------------------------------------------
 documents: defineTable({
   title: v.string(),
   content: v.optional(v.string()),
   organizationId: v.optional(v.string()),
   coverImage: v.optional(v.string()),
   icon: v.optional(v.string()),
   parentDocument: v.optional(v.id("documents")),
   isPublished: v.boolean(),
   isArchived: v.boolean(),
   // IMPORTANT: your code uses userId (not createdBy)
   userId: v.string(),
   createdAt: v.number(),
   updatedAt: v.number(),
  })
  .index("by_organization", ["organizationId"])
  .index("by_parent", ["parentDocument"])
  .index("by_isArchived", ["isArchived"])
  .index("by_user", ["userId"])
  .index("by_user_parent", ["userId", "parentDocument"]),
 
 // ------------------------------------------------------------
 // SERVICES (for your services marketplace)
 // ------------------------------------------------------------
 services: defineTable({
   name: v.string(),
   description: v.optional(v.string()),
   price: v.optional(v.number()),
   isPublic: v.boolean(),
   archived: v.boolean(),
   slug: v.string(),
   createdAt: v.number(),
   updatedAt: v.number(),
   createdBy: v.string(),
   createdAt: v.float64(),
   updatedAt: v.float64(),
  })
  .index("by_slug", ["slug"])
  .index("by_isPublic_archived", ["isPublic", "archived"])
  .index("by_archived", ["archived"])
  .index("by_createdBy", ["createdBy"]),
});