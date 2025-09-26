// convex/users.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** CREATE with unique email/username (if provided) */
export const create = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, { email, name, username }) => {
    // Uniqueness checks
    const emailClash = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first();
    if (emailClash) throw new Error("Email already exists");

    if (username) {
      const usernameClash = await ctx.db
        .query("users")
        .withIndex("by_username", (q: any) => q.eq("username", username))
        .first();
      if (usernameClash) throw new Error("Username already exists");
    }

    const now = Date.now();
    return await ctx.db.insert("users", {
      email,
      name,
      username: username ?? undefined,
      createdAt: now,
      updatedAt: now,
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
    const resolvedEmail = (email ?? identity?.email ?? "").trim();
    if (!resolvedEmail) throw new Error("Email is required");

    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", resolvedEmail))
      .first();

    const patch = {
      email: resolvedEmail,
      name: (name ?? identity?.name ?? "") || undefined,
      username: username ?? undefined,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return await ctx.db.insert("users", { ...patch, createdAt: now });
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
      const trimmed = email.trim();
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
        if (clash && clash._id !== id) throw new Error("Username already exists");
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
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first(),
});

/** Current user (by identity email) */
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

/** Seed example user (handy for local dev) */
export const seedTestUser = mutation({
  args: {},
  handler: async (ctx) => {
    const email = "test@example.com";
    const exists = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first();
    if (exists) return exists._id;

    const now = Date.now();
    return await ctx.db.insert("users", {
      email,
      name: "Test User",
      username: "testuser",
      createdAt: now,
      updatedAt: now,
    });
  },
});
