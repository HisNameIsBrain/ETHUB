// convex/documents.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

type DocumentId = Id<"documents">;

export const create = mutation({
  args: {
    title: v.string(),
    content: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    coverImage: v.optional(v.string()),
    templateId: v.optional(v.id("templates")),
    propertySchemaId: v.optional(v.id("propertySchemas")),
    properties: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;
    const now = Date.now();

    const docId = await ctx.db.insert("documents", {
      title: args.title,
      content: args.content ?? "",
      userId,
      parentDocument: args.parentDocument,
      isArchived: false,
      templateId: args.templateId,
      propertySchemaId: args.propertySchemaId,
      properties: args.properties,
      coverImage: args.coverImage,
      updatedAt: now,
    });

    return docId;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    parentDocument: v.optional(v.id("documents")),
    coverImage: v.optional(v.string()),
    templateId: v.optional(v.id("templates")),
    propertySchemaId: v.optional(v.id("propertySchemas")),
    properties: v.optional(v.record(v.string(), v.any())),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Not found");
    if (existing.userId !== userId) throw new Error("Forbidden");

    const patch: any = { updatedAt: Date.now() };

    if (args.title !== undefined) patch.title = args.title;
    if (args.content !== undefined) patch.content = args.content;
    if (args.parentDocument !== undefined) patch.parentDocument = args.parentDocument;
    if (args.coverImage !== undefined) patch.coverImage = args.coverImage;
    if (args.templateId !== undefined) patch.templateId = args.templateId;
    if (args.propertySchemaId !== undefined) patch.propertySchemaId = args.propertySchemaId;
    if (args.properties !== undefined) patch.properties = args.properties;
    if (args.isArchived !== undefined) patch.isArchived = args.isArchived;

    await ctx.db.patch(args.id, patch);
    return args.id;
  },
});

export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Not found");
    if (existing.userId !== userId) throw new Error("Forbidden");

    await ctx.db.patch(id, { isArchived: true, updatedAt: Date.now() });
  },
});

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Not found");
    if (existing.userId !== userId) throw new Error("Forbidden");

    await ctx.db.patch(id, { isArchived: false, updatedAt: Date.now() });
  },
});

export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    return doc ?? null;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;

    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();
  },
});

export const getChildren = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, { parentDocument }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;

    const queryBuilder = ctx.db
      .query("documents")
      .withIndex("by_parent", (q) =>
        q.eq("parentDocument", parentDocument ?? null as any)
      );

    const docs = await queryBuilder.collect();
    return docs.filter((d) => d.userId === userId && !d.isArchived);
  },
});

export const getTrash = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;

    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .collect();
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;

    const existing = await ctx.db.get(id);
    if (!existing) return;
    if (existing.userId !== userId) throw new Error("Forbidden");

    await ctx.db.delete(id);
  },
});
