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
      const emailClash = await ctx.db
        .query("users")
        .withIndex("by_email", (q: any) => q.eq("email", email))
        .first();
      if (emailClash && emailClash._id !== id) throw new Error("Email already exists");
      patch.email = email;
    }

    if (username !== undefined) {
      if (username) {
        const usernameClash = await ctx.db
          .query("users")
          .withIndex("by_username", (q: any) => q.eq("username", username))
          .first();
        if (usernameClash && usernameClash._id !== id) throw new Error("Username already exists");
        patch.username = username;
      } else {
        patch.username = undefined; // clear username
      }
    }

    if (name !== undefined) patch.name = name;

    await ctx.db.patch(id, patch);
  },
});

/** READ: all (paginated) */
export const list = query({
  args: { offset: v.optional(v.number()), limit: v.optional(v.number()) },
  handler: async (ctx, { offset = 0, limit = 50 }) => {
    const rows = await ctx.db
      .query("users")
      .withIndex("by_createdAt", (q: any) => q.gte("createdAt", 0))
      .collect();
    const total = rows.length;
    const slice = rows.slice(offset, offset + limit);
    return { users: slice, total, offset, hasMore: offset + limit < total };
  },
});

/** READ: by id */
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

/** READ: by email */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) =>
    ctx.db.query("users").withIndex("by_email", (q: any) => q.eq("email", email)).first(),
});

/** DELETE */
export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/** Seed: insert a test user */
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
