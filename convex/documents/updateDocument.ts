import { query, mutation } from "@/convex/_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "@/convex/_generated/server";
import type { Id } from "@/convex/_generated/dataModel";


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
