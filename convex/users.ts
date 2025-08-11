import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const ensureUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async ({ db }, args) => {
    const existing = await db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();
    if (existing) return existing._id;

    return await db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      name: args.name,
      email: args.email,
      pictureUrl: args.pictureUrl,
      userId: args.userId,
      createdAt: Date.now(),
    });
  },
});
