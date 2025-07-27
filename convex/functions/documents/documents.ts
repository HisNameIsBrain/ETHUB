import { mutation, query } from "@/convex/_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "@/convex/_generated/server";
import type { Id } from "@/convex/_generated/dataModel";

export const getAll = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("documents").collect();
  },
});

export const getById = query({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx: QueryCtx, args: { id: Id < "documents" > }) => {
    return await ctx.db.get(args.id);
  },
});

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
      content ? : string;
      coverImage ? : string;
      icon ? : string;
      userId: string;
      orgId: string;
      parentDocument ? : Id < "documents" > ;
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
      id: Id < "documents" > ;
      title ? : string;
      content ? : string;
      coverImage ? : string;
      icon ? : string;
      isArchived ? : boolean;
      isPublished ? : boolean;
      parentDocument ? : Id < "documents" > ;
    }
  ) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx: MutationCtx, args: { id: Id < "documents" > }) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});