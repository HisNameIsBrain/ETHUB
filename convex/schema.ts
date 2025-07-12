import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ──────────────────────────────────────────────
  // 📄 Documents Table
  // ──────────────────────────────────────────────
  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),

    // Auth & org fields
    userId: v.string(),       // Clerk user ID
    orgId: v.string(),        // Clerk organization ID

    // Relationships
    parentDocument: v.optional(v.id("documents")),

    // Status & control
    isArchived: v.boolean(),
    isPublished: v.boolean(),

    // Timestamps
    createdAt: v.number(),    // Use `Date.now()` on the client
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_user_parent", ["userId", "parentDocument"]),

  // ──────────────────────────────────────────────
  // 👥 Permissions Table (Optional: Sharing Control)
  // ──────────────────────────────────────────────
  permissions: defineTable({
    documentId: v.id("documents"),
    userId: v.string(), // Clerk user ID
    role: v.union(
      v.literal("viewer"),
      v.literal("editor"),
      v.literal("admin")
    ),
  })
    .index("by_user", ["userId"])
    .index("by_document", ["documentId"]),

  // ──────────────────────────────────────────────
  // 🏢 Organization Memberships (Optional: Org Role Control)
  // ──────────────────────────────────────────────
  organizationMemberships: defineTable({
    orgId: v.string(), // Clerk org ID
    userId: v.string(), // Clerk user ID
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member")
    ),
  })
    .index("by_org", ["orgId"])
    .index("by_user", ["userId"]),
});