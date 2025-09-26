import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upsert the current authenticated user into the `users` table.
 * Uses email as the unique key (schema has index by_email).
 */
export const ensureUser = mutation({
  args: {
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, { email, name, username }) => {
    const identity = await ctx.auth.getUserIdentity();
    // Resolve email from args or identity; email is required by schema
    const resolvedEmail =
      (email ?? identity?.email ?? "").trim();
    if (!resolvedEmail) throw new Error("Email is required");

    const now = Date.now();

    // Find by email
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", resolvedEmail))
      .first();

    // Normalize fields
    const patch = {
      email: resolvedEmail,
      name: (name ?? identity?.name ?? "").trim() || undefined,
      username: username ?? undefined,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    // Insert new
    return await ctx.db.insert("users", {
      ...patch,
      createdAt: now,
    });
  },
});

/** Convenience: fetch current user by identity email (if present) */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email?.trim();
    if (!email) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first();
  },
});
