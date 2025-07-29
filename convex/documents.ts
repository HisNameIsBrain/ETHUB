// convex/documents.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getDocumentById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createDocument = mutation({
  args: {
    title: v.string(),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isArchived: v.boolean(),
    isPublished: v.optional(v.boolean()),
    parentDocument: v.optional(v.id("documents")),
    orgId: v.optional(v.id("organizations")),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", args);
  },
});

export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const removeDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});