// convex/documents.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ------------------------------ Create ------------------------------ */
export const create = mutation({
  args: {
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const now = Date.now();
    return await ctx.db.insert("documents", {
      title: args.title ?? "Untitled",
      content: args.content ?? "",
      organizationId: args.organizationId,
      coverImage: args.coverImage,
      icon: args.icon,
      parentDocument: args.parentDocument,
      isPublished: false,
      isArchived: false,
      userId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/* ------------------------------ Update ------------------------------ */
export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Document not found");

    await ctx.db.patch(id, {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.content !== undefined ? { content: patch.content } : {}),
      ...(patch.organizationId !== undefined
        ? { organizationId: patch.organizationId }
        : {}),
      ...(patch.parentDocument !== undefined
        ? { parentDocument: patch.parentDocument }
        : {}),
      ...(patch.coverImage !== undefined ? { coverImage: patch.coverImage } : {}),
      ...(patch.icon !== undefined ? { icon: patch.icon } : {}),
      ...(patch.isPublished !== undefined ? { isPublished: patch.isPublished } : {}),
      ...(patch.isArchived !== undefined ? { isArchived: patch.isArchived } : {}),
      updatedAt: Date.now(),
    });

    return { id };
  },
});

/* --------------------------- Archive / Restore --------------------------- */
export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Document not found");
    await ctx.db.patch(id, { isArchived: true, updatedAt: Date.now() });
    return { id, isArchived: true };
  },
});

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Document not found");
    await ctx.db.patch(id, { isArchived: false, updatedAt: Date.now() });
    return { id, isArchived: false };
  },
});

/* ------------------------------- Remove ------------------------------- */
export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Document not found");
    await ctx.db.delete(id);
    return { id };
  },
});

/* -------------------------------- Reads -------------------------------- */
export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/** Children for current user (not archived) */
export const getChildren = query({
  args: { parentDocument: v.optional(v.id("documents")) },
  handler: async (ctx, { parentDocument }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const rows = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", identity.subject).eq("parentDocument", parentDocument ?? undefined)
      )
      .collect();

    return rows.filter((d) => !d.isArchived);
  },
});

/** Sidebar: top-level docs (no parent) for current user */
export const getSidebar = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const rows = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return rows.filter((d) => !d.isArchived && d.parentDocument === undefined);
  },
});

/** Trash: archived docs for current user */
export const getTrash = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const archivedRows = await ctx.db
      .query("documents")
      .withIndex("by_isArchived", (q) => q.eq("isArchived", true))
      .collect();

    return archivedRows.filter((d) => d.userId === identity.subject);
  },
});
