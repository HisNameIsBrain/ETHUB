import { mutation } from "convex/server";
import { v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export const create = mutation({
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
  handler: async (
    ctx: MutationCtx,
    args: {
      title: string;
      content?: string;
      coverImage?: string;
      icon?: string;
      userId: string;
      orgId: string;
      parentDocument?: Id<"documents">;
      isArchived: boolean;
      isPublished: boolean;
    }
  ) => {
    const now = Date.now();
    return await ctx.db.insert("documents", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});
