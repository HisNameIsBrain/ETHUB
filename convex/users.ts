// convex/users.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Helper to normalize an email (lowercase + trim) or return empty string.
 */
function normEmail(e?: string | null) {
  return (e ?? "").trim().toLowerCase() || "";
}

/**
 * Helper to get clerkId from identity if present.
 */
async function getClerkIdFromCtx(ctx: any) {
  const ident = await ctx.auth.getUserIdentity();
  return ident?.subject ?? "";
}

/** Create or return the current user record for the signed-in identity */
export const getOrCreateCurrent = mutation({
  args: {},
  handler: async (ctx) => {
    const ident = await ctx.auth.getUserIdentity();
    if (!ident) throw new Error("Not authenticated");
    const clerkId = ident.subject;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existing) return existing._id;

    const now = Date.now();
    return await ctx.db.insert("users", {
      clerkId,
      email: normEmail(ident.email),
      name: ident.name ?? "",
      username: undefined,
      createdAt: now,
      updatedAt: now,
      imageUrl: undefined,
      userId: undefined,
      role: undefined,
      tokenIdentifier: undefined,
    });
  },
});

/** CREATE with unique email/username (if provided) */
export const create = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, { email, name, username }) => {
    const e = normEmail(email);

    // Uniqueness checks
    const emailClash = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", e))
      .first();
    if (emailClash) throw new Error("Email already exists");

    if (username) {
      const u = username.trim();
      const usernameClash = await ctx.db
        .query("users")
        .withIndex("by_username", (q: any) => q.eq("username", u))
        .first();
      if (usernameClash) throw new Error("Username already exists");
    }

    const now = Date.now();
    // Try to reuse clerkId from auth if present, otherwise set empty string
    const clerkId = await getClerkIdFromCtx(ctx);

    return await ctx.db.insert("users", {
      clerkId,
      email: e || undefined,
      name: name ?? undefined,
      username: username?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      imageUrl: undefined,
      userId: undefined,
      role: undefined,
      tokenIdentifier: undefined,
    });
  },
});

/** UPSERT current user by email (from args or identity) */
export const ensureUser = mutation({
  args: {
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, { email, name, username }) => {
    const identity = await ctx.auth.getUserIdentity();
    const resolvedEmail = normEmail(email ?? identity?.email ?? "");
    if (!resolvedEmail) throw new Error("Email is required");

    const now = Date.now();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", resolvedEmail))
      .first();

    const patch: any = {
      email: resolvedEmail,
      name: (name ?? identity?.name ?? "") || undefined,
      username: username?.trim() || undefined,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    // New insert: include clerkId when available (otherwise empty string)
    const clerkId = identity?.subject ?? "";
    return await ctx.db.insert("users", {
      ...patch,
      clerkId,
      createdAt: now,
      // ensure fields expected by schema are present (undefined allowed for optionals)
      imageUrl: undefined,
      userId: undefined,
      role: undefined,
      tokenIdentifier: undefined,
    });
  },
});

/** UPDATE by id, keeping uniqueness */
export const update = mutation({
  args: {
    id: v.id("users"),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, { id, email, name, username }) => {
    const patch: any = { updatedAt: Date.now() };

    if (email !== undefined) {
      const trimmed = normEmail(email);
      if (!trimmed) throw new Error("Email cannot be empty");
      const clash = await ctx.db
        .query("users")
        .withIndex("by_email", (q: any) => q.eq("email", trimmed))
        .first();
      if (clash && clash._id !== id) throw new Error("Email already exists");
      patch.email = trimmed;
    }

    if (username !== undefined) {
      const trimmed = username?.trim() || undefined;
      if (trimmed) {
        const clash = await ctx.db
          .query("users")
          .withIndex("by_username", (q: any) => q.eq("username", trimmed))
          .first();
        if (clash && clash._id !== id)
          throw new Error("Username already exists");
      }
      patch.username = trimmed;
    }

    if (name !== undefined) patch.name = name;

    await ctx.db.patch(id, patch);
  },
});

/** DELETE by id */
export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/** LIST (paginated, newest first) */
export const list = query({
  args: { offset: v.optional(v.number()), limit: v.optional(v.number()) },
  handler: async (ctx, { offset = 0, limit = 50 }) => {
    const rows = await ctx.db
      .query("users")
      .withIndex("by_createdAt", (q: any) => q.gte("createdAt", 0))
      .collect();

    rows.sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

    const total = rows.length;
    const slice = rows.slice(offset, offset + limit);
    return { users: slice, total, offset, hasMore: offset + limit < total };
  },
});

/** GET by id */
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

/** GET by email */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) =>
    ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", normEmail(email)))
      .first(),
});

/** Current user (by identity subject -> clerkId) */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const ident = await ctx.auth.getUserIdentity();
    if (!ident) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", ident.subject))
      .unique();
  },
});

export const upsert = ensureUser;
