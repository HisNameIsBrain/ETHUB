import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** normalize email */
function normEmail(e?: string | null) {
  return (e ?? "").trim().toLowerCase() || "";
}

/** helper to get clerkId (auth subject) or empty string */
async function getClerkId(ctx: any) {
  const ident = await ctx.auth.getUserIdentity();
  return ident?.subject ?? "";
}

/**
 * Upsert the current authenticated user into the `users` table.
 * Uses email as the unique key (schema has index by_email).
 * Ensures required fields (clerkId, createdAt, updatedAt) are present.
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
    const resolvedEmail = normEmail(email ?? identity?.email ?? "");
    if (!resolvedEmail) throw new Error("Email is required");

    const now = Date.now();
    const clerkId = identity?.subject ?? "";

    // Find by email
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", resolvedEmail))
      .first();

    // Normalize fields for patch/insert
    const patch: any = {
      email: resolvedEmail,
      name: (name ?? identity?.name ?? "").trim() || undefined,
      username: username?.trim() || undefined,
      updatedAt: now,
    };

    if (existing) {
      // If clerkId is missing on existing record but present in identity, patch it too
      if (clerkId && !(existing.clerkId)) {
        await ctx.db.patch(existing._id, { ...patch, clerkId });
      } else {
        await ctx.db.patch(existing._id, patch);
      }
      return existing._id;
    }

    // Insert new — include required clerkId, createdAt, updatedAt, and safe defaults
    return await ctx.db.insert("users", {
      ...patch,
      clerkId,
      createdAt: now,
      // optional fields set explicitly to undefined when not provided
      imageUrl: undefined,
      userId: undefined,
      role: undefined,
      tokenIdentifier: undefined,
    });
  },
});

/** Convenience: fetch current user by identity (prefer clerkId, fall back to email) */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;
    if (clerkId) {
      const byClerk = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", clerkId))
        .unique();
      if (byClerk) return byClerk;
    }

    // Fallback: try email if clerk lookup failed
    const email = normEmail(identity.email);
    if (!email) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first();
  },
});
