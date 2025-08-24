import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upsert by tokenIdentifier (used by some auth flows).
 * Matches your index: by_token on tokenIdentifier.
 */
export const ensureByToken = mutation({
  args: {
    tokenIdentifier: v.string(),
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    pictureUrl: v.optional(v.string()), // we’ll map to imageUrl
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    const patch = {
      userId: args.userId,
      name: args.name ?? "",
      email: args.email ?? "",
      imageUrl: args.pictureUrl ?? "", // schema field is imageUrl
      username: args.username,
      phoneNumber: args.phoneNumber,
      role: args.role ?? "user" as const,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      ...patch,
      createdAt: now,
    });
  },
});

/** Optional helper: fetch current user doc via subject */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
      .first();
  },
});
