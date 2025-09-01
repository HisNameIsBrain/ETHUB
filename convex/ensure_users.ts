import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upserts the current authenticated user (by Clerk subject) into the users table.
 * Matches your schema: required name/email/imageUrl/role + float64 timestamps.
 */
export const ensureUser = mutation({
  args: {
    // Fallbacks are applied below for required fields
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const now = Date.now();

    const userId = identity.subject;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .first();

    const patch = {
      // Required in schema: ensure defined strings
      name: args.name ?? identity.name ?? "",
      email: args.email ?? identity.email ?? "",
      imageUrl: args.imageUrl ?? identity.pictureUrl ?? "",
      // Optional
      username: args.username,
      phoneNumber: args.phoneNumber,
      role: args.role ?? ("user" as const),
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    const id = await ctx.db.insert("users", {
      userId,
      tokenIdentifier: identity.tokenIdentifier ?? undefined,
      ...patch,
      createdAt: now,
    });
    return id;
  },
});
