import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertCurrentUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { email, name, username, phoneNumber, imageUrl }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject; // Clerk user id
    const tokenIdentifier = identity.tokenIdentifier ?? undefined;
    const now = Date.now();
    const lower = email.toLowerCase();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: lower,
        name,
        username,
        phoneNumber,
        imageUrl,
        tokenIdentifier,
        updatedAt: now,
      });
      return existing._id;
    }

    const id = await ctx.db.insert("users", {
      userId,
      email: lower,
      name,
      username,
      phoneNumber,
      imageUrl,
      tokenIdentifier,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Optional: ensureUser(tokenIdentifier, ...)
 * If you need a path that doesn't rely on auth in this call, you can use this.
 */
export const ensureUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { tokenIdentifier, name, email, imageUrl }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (existing) return existing._id;

    const now = Date.now();
    const id = await ctx.db.insert("users", {
      userId: "", // fill this with a real id if available in your flow
      tokenIdentifier,
      name: name ?? "Anonymous",
      email: (email ?? "").toLowerCase(),
      imageUrl: imageUrl ?? "",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});
