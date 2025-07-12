import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addPermission = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(), // Clerk user ID of the invited user
    role: v.union(
      v.literal("viewer"),
      v.literal("editor"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Optional: Check if current user owns the document
    const document = await ctx.db.get(args.documentId);
    if (!document || document.userId !== identity.subject) {
      throw new Error("You don't have permission to share this document.");
    }

    return await ctx.db.insert("permissions", args);
  },
});

export const getPermissionsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("permissions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getPermissionsByDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("permissions")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
  },
});