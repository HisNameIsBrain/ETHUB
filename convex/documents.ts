// convex/documents.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api"; // ← add this

// ... where you call runQuery:
const children = await ctx.runQuery(api.documents.getChildren, {
  parentDocument: someParentId, // your existing arg(s)
});

// Give the mapper a type so destructuring isn’t implicit any
type ChildDoc = {
  _id: Id<"documents">;
  title?: string;
  icon?: string;
  isPublished?: boolean;
  parentDocument?: Id<"documents"> | null;
};

return children.map(({ _id, title, icon, isPublished, parentDocument }: ChildDoc) => ({
  _id,
  title,
  icon,
  isPublished,
  parentDocument,
}));
async function requireUserId(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return identity.subject;
}

async function archiveDescendants(ctx: any, parentId: Id<"documents">) {
  const kids = await ctx.db
    .query("documents")
    .withIndex("by_parent", (q: any) => q.eq("parentDocument", parentId))
    .collect();
  for (const k of kids) {
    await ctx.db.patch(k._id, { isArchived: true, updatedAt: Date.now() });
    await archiveDescendants(ctx, k._id);
  }
}

// ------- mutations -------
export const create = mutation({
  args: {
    title: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const id = await ctx.db.insert("documents", {
      title: args.title ?? "Untitled",
      content: "",
      coverImage: args.coverImage,
      icon: args.icon,
      isArchived: false,
      isPublished: args.isPublished ?? true,   // ✅ default public
      parentDocument: args.parentDocument,
      userId,
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
    isArchived: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const patch: any = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title;
    if (args.content !== undefined) patch.content = args.content;
    if (args.coverImage !== undefined) patch.coverImage = args.coverImage;
    if (args.icon !== undefined) patch.icon = args.icon;
    if (args.isArchived !== undefined) patch.isArchived = args.isArchived;
    if (args.isPublished !== undefined) patch.isPublished = args.isPublished;
    if (args.parentDocument !== undefined) patch.parentDocument = args.parentDocument;
    await ctx.db.patch(args.id, patch);
  },
});

export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { isArchived: true, updatedAt: Date.now() });
    await archiveDescendants(ctx, id);
  },
});

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { isArchived: false, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ------- queries -------
export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.userId !== userId) return null;
    return doc;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect();
    return docs
      .filter((d: any) => !d.isArchived)
      .sort(
        (a: any, b: any) =>
          (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0)
      );
  },
});

export const getTrash = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect();
    return docs.filter((d: any) => d.isArchived);
  },
});
export const getSidebar = query({
  args: { parentDocument: v.optional(v.id("documents")) },
  handler: async (ctx, args) => {
    const children = await ctx.runQuery(api.documents.getChildren, {
      parentDocument: args.parentDocument,
    });
    return children.map(({ _id, title, icon, isPublished, parentDocument }) => ({
      _id,
      title,
      icon,
      isPublished,
      parentDocument,
    }));
  },
});

export const getChildren = query({
  args: { parentId: v.id("documents") },
  handler: async (ctx, { parentId }) => {
    const userId = await requireUserId(ctx);
    const kids = await ctx.db
      .query("documents")
      .withIndex("by_parent", (q: any) => q.eq("parentDocument", parentId))
      .collect();
    return kids.filter((d: any) => d.userId === userId && !d.isArchived);
  },
});
