import { mutation } from "convex/server";
import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const update = mutation({
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
  handler: async (
    ctx: MutationCtx,
    args: {
      id: Id<"documents">;
      title?: string;
      content?: string;
      coverImage?: string;
      icon?: string;
      isArchived?: boolean;
      isPublished?: boolean;
      parentDocument?: Id<"documents">;
    }
  ) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
