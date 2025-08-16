// convex/users.ts
import { mutation, query } from "./_generated/server";
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

    const userId = identity.subject;
    const tokenIdentifier = identity.tokenIdentifier ?? undefined;
    const now = Date.now();
    const lower = email.toLowerCase();

    // Look up existing user by userId
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: lower, // always safe
        // Only include required fields if we have values; otherwise keep existing
        ...(name !== undefined ? { name } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        // Optionals
        ...(username !== undefined ? { username } : {}),
        ...(phoneNumber !== undefined ? { phoneNumber } : {}),
        ...(tokenIdentifier ? { tokenIdentifier } : {}),
        updatedAt: now,
      });
      return existing._id;
    }

    // Insert new user (provide required fields explicitly)
    const id = await ctx.db.insert("users", {
      userId,
      role: "user", // required by your types
      name: name ?? identity.name ?? "Anonymous",
      email: lower,
      imageUrl: imageUrl ?? identity.pictureUrl ?? "",
      username,
      phoneNumber,
      tokenIdentifier,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
  },
});
