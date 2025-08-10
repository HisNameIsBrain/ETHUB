// convex/documents.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id, Doc } from "./_generated/dataModel";

async function requireUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return identity.subject;
}

/** Archive (recursively) */
export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const existing = await ctx.db.get(args.id as Id < "documents" > );
    if (!existing) throw new Error("Not found");
    if (existing.userId !== userId) throw new Error("Not authorized");
    
    const recursiveArchive = async (documentId: Id < "documents" > ) => {
      // children by (userId, parentDocument)
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();
      
      await ctx.db.patch(documentId, { isArchived: true, updatedAt: Date.now() });
      
      for (const child of children) {
        await recursiveArchive(child._id);
      }
    };
    
    await recursiveArchive(args.id as Id < "documents" > );
    
    // Return updated root
    return await ctx.db.patch(args.id as Id < "documents" > , {
      isArchived: true,
      updatedAt: Date.now(),
    });
  },
});

/** Restore (recursively) */
export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const existing = await ctx.db.get(args.id as Id < "documents" > );
    if (!existing) throw new Error("Not found");
    if (existing.userId !== userId) throw new Error("Not authorized");
    
    const recursiveRestore = async (documentId: Id < "documents" > ) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();
      
      await ctx.db.patch(documentId, { isArchived: false, updatedAt: Date.now() });
      
      for (const child of children) {
        await recursiveRestore(child._id);
      }
    };
    
    // If parent is archived, detach before restoring
    const options: Partial < Doc < "documents" >> = { isArchived: false, updatedAt: Date.now() };
    if (existing.parentDocument) {
      const parent = await ctx.db.get(existing.parentDocument as Id < "documents" > );
      if (parent?.isArchived) {
        options.parentDocument = undefined;
      }
    }
    
    await ctx.db.patch(args.id as Id < "documents" > , options);
    await recursiveRestore(args.id as Id < "documents" > );
    
    return await ctx.db.get(args.id as Id < "documents" > );
  },
});

/** Create */
export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const now = Date.now();
    
    const id = await ctx.db.insert("documents", {
      userId,
      title: args.title,
      content: "",
      icon: undefined,
      coverImage: undefined,
      parentDocument: args.parentDocument,
      isArchived: false,
      isPublished: false,
      organizationId: undefined,
      createdAt: now,
      updatedAt: now,
    });
    
    return await ctx.db.get(id);
  },
});

/** List non-archived for user (optionally by parent) */
export const getByParent = query({
  args: { parentDocument: v.optional(v.id("documents")) },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    
    const q = ctx.db
      .query("documents")
      .withIndex(
        args.parentDocument ? "by_user_parent" : "by_user",
        (idx) =>
        args.parentDocument ?
        idx.eq("userId", userId).eq("parentDocument", args.parentDocument!) :
        idx.eq("userId", userId)
      )
      .filter((q) => q.eq(q.field("isArchived"), false));
    
    return await q.collect();
  },
});

/** List archived for user */
export const getTrash = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .collect();
  },
});