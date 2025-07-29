import { mutation, query } from "@/convex/_generated/server";
import { v } from "convex/values";
import type { Id } from "@/convex/_generated/dataModel";

// Get All Documents
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("documents").collect();
  },
});

// Get Document by ID
export const getDocumentById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create Document
export const createDocument = mutation({
  args: {
    title: v.string(),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    userId: v.string(),
    orgId: v.string(),
    parentDocument: v.optional(v.id("documents")),
    isArchived: v.boolean(),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("documents", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update Document
export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Remove Document
export const removeDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
