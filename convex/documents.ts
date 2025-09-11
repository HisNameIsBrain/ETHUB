import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// auth
async function requireUserId(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity.subject;
}

// CREATE
export const create = mutation({
  args: {
    title: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    return await ctx.db.insert("documents", {
      title: args.title ?? "Untitled",
      content: "",
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: args.isPublished ?? false,
      icon: args.icon,
      coverImage: args.coverImage,
      organizationId: args.organizationId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// UPDATE
export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      ...("title" in args ? { title: args.title } : {}),
      ...("content" in args ? { content: args.content } : {}),
      ...("parentDocument" in args ? { parentDocument: args.parentDocument } : {}),
      ...("icon" in args ? { icon: args.icon } : {}),
      ...("coverImage" in args ? { coverImage: args.coverImage } : {}),
      ...("isPublic" in args ? { isPublished: args.isPublic } : {}),
      ...("isArchived" in args ? { isArchived: args.isArchived } : {}),
      updatedAt: Date.now(),
    });
    return "ok";
  },
});

// ARCHIVE / RESTORE / REMOVE
export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { isArchived: true, updatedAt: Date.now() });
    return id;
  },
});

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { isArchived: false, updatedAt: Date.now() });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
    return id;
  },
});

// ICON
export const removeIcon = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { icon: undefined, updatedAt: Date.now() });
    return "ok";
  },
});

// QUERIES
export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getChildren = query({
  args: { parentDocument: v.optional(v.id("documents")) },
  handler: async (ctx, { parentDocument }) => {
    const userId = await requireUserId(ctx);
    if (parentDocument) {
      const rows = await ctx.db
        .query("documents")
        .withIndex("by_parent", (q: any) => q.eq("parentDocument", parentDocument))
        .collect();
      return rows.filter((r: any) => r.userId === userId && !r.isArchived);
    }
    const rows = await ctx.db
      .query("documents")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    return rows.filter((r: any) => !r.parentDocument && !r.isArchived);
  },
});

// Sidebar alias expected by your UI
export const getSidebar = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("documents")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    return rows.filter((d: any) => !d.isArchived);
  },
});

// List root non-archived
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("documents")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    return rows.filter((d: any) => !d.parentDocument && !d.isArchived);
  },
});

// Trash
export const getTrash = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("documents")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    return rows.filter((d: any) => d.isArchived);
  },
});

// Search
export const getSearch = query({
  args: { term: v.string() },
  handler: async (ctx, { term }) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("documents")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    const t = term.toLowerCase();
    return rows.filter((d: any) => (d.title ?? "").toLowerCase().includes(t)).slice(0, 24);
  },
});
