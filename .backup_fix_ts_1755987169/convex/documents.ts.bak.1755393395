// convex/documents.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Require an authenticated user
async function requireUserId(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity.subject;
}

// Descendants helpers (type q as any to avoid implicit any)
async function archiveDescendants(ctx: any, ownerId: string, parentId: Id<"documents">) {
  const children = await ctx.db
    .query("documents")
    .withIndex("by_parent", (q: any) => q.eq("parentDocument", parentId))
    .collect();
  for (const child of children) {
    if (child.userId !== ownerId) continue;
    await ctx.db.patch(child._id, { isArchived: true, updatedAt: Date.now() });
    await archiveDescendants(ctx, ownerId, child._id);
  }
}

async function restoreDescendants(ctx: any, ownerId: string, parentId: Id<"documents">) {
  const children = await ctx.db
    .query("documents")
    .withIndex("by_parent", (q: any) => q.eq("parentDocument", parentId))
    .collect();
  for (const child of children) {
    if (child.userId !== ownerId) continue;
    await ctx.db.patch(child._id, { isArchived: false, updatedAt: Date.now() });
    await restoreDescendants(ctx, ownerId, child._id);
  }
}

// ----------------- Mutations -----------------

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    if (args.parentDocument) {
      const parent = await ctx.db.get(args.parentDocument);
      if (!parent || parent.userId !== userId) throw new Error("Invalid parent document");
    }

    const now = Date.now();
    const id = await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      coverImage: args.coverImage,
      icon: args.icon,
      organizationId: args.organizationId,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    organizationId: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Document not found");
    if (existing.userId !== userId) throw new Error("Unauthorized");

    if (args.parentDocument) {
      const parent = await ctx.db.get(args.parentDocument);
      if (!parent || parent.userId !== userId) throw new Error("Invalid parent document");
    }

    const { id, ...rest } = args;
    const toPatch: Partial<Doc<"documents">> = { updatedAt: Date.now() };
    for (const [k, v_] of Object.entries(rest)) {
      if (v_ !== undefined) (toPatch as any)[k] = v_;
    }
    return await ctx.db.patch(id, toPatch);
  },
});

export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Document not found");
    if (doc.userId !== userId) throw new Error("Not authorized");

    const patched = await ctx.db.patch(id, { isArchived: true, updatedAt: Date.now() });
    await archiveDescendants(ctx, userId, id);
    return patched;
  },
});

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Document not found");
    if (existing.userId !== userId) throw new Error("Not authorized");

    const patch: Partial<Doc<"documents">> = { isArchived: false, updatedAt: Date.now() };
    if (existing.parentDocument) {
      const parent = await ctx.db.get(existing.parentDocument);
      if (parent?.isArchived) patch.parentDocument = undefined;
    }

    const updated = await ctx.db.patch(id, patch);
    await restoreDescendants(ctx, userId, id);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Document not found");
    if (doc.userId !== userId) throw new Error("Not authorized");
    return await ctx.db.delete(id);
  },
});

export const removeIcon = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Document not found");
    if (doc.userId !== userId) throw new Error("Unauthorized");
    return await ctx.db.patch(id, { icon: undefined, updatedAt: Date.now() });
  },
});

export const removeCoverImage = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Document not found");
    if (doc.userId !== userId) throw new Error("Unauthorized");
    return await ctx.db.patch(id, { coverImage: undefined, updatedAt: Date.now() });
  },
});

// ----------------- Queries -----------------

export const getSidebar = query({
  args: { parentDocument: v.optional(v.id("documents")) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    if (args.parentDocument) {
      const rows = await ctx.db
        .query("documents")
        .withIndex("by_parent", (q: any) => q.eq("parentDocument", args.parentDocument!))
        .collect();

      return rows
        .filter(r => r.userId === userId && r.isArchived === false)
        .sort((a, b) => b._creationTime - a._creationTime);
    }

    const rows = await ctx.db
      .query("documents")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect();

    return rows
      .filter(r => r.isArchived === false && r.parentDocument === undefined)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getTrash = query({
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const rows = await ctx.db
      .query("documents")
      .withIndex("by_isArchived", (q: any) => q.eq("isArchived", true))
      .collect();

    return rows
      .filter(r => r.userId === userId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const rows = await ctx.db
      .query("documents")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect();

    return rows
      .filter(r => r.isArchived === false)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const identity = await ctx.auth.getUserIdentity();

    const doc = await ctx.db.get(documentId);
    if (!doc) throw new Error("Document not found");

    if (doc.isPublished && !doc.isArchived) return doc;

    if (!identity) throw new Error("Not authenticated");
    if (doc.userId !== identity.subject) throw new Error("Not authorized");

    return doc;
  },
});
