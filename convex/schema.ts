import { defineSchema, defineTable } from "convex/server"; 
import { v } from "convex/values";

export default defineSchema({ documents: defineTable({ title: v.string(), content: v.optional(v.string()), coverImage: v.optional(v.string()), icon: v.optional(v.string()), userId: v.string(), orgId: v.string(), parentDocument: v.optional(v.id("documents")), isArchived: v.boolean(), isPublished: v.boolean(), createdAt: v.number(), updatedAt: v.optional(v.number()), }) .index("by_user", ["userId"]) .index("by_org", ["orgId"]) .index("by_user_parent", ["userId", "parentDocument"]),

permissions: defineTable({ documentId: v.id("documents"), userId: v.string(), role: v.union( v.literal("viewer"), v.literal("editor"), v.literal("admin") ), }) .index("by_user", ["userId"]) .index("by_document", ["documentId"]),

organizationMemberships: defineTable({ orgId: v.string(), userId: v.string(), role: v.union( v.literal("owner"), v.literal("admin"), v.literal("member") ), }) .index("by_org", ["orgId"]) .index("by_user", ["userId"]),

services: defineTable({ name: v.string(), deliveryTime: v.string(), price: v.string(), createdAt: v.number(), updatedAt: v.optional(v.number()), }).authorization(({ auth }) => { return { create: auth.role === "admin", update: auth.role === "admin", delete: auth.role === "admin", }; }), });

