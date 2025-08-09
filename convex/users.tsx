import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// --- QUERIES ---

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const u = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .unique();
    return u ?? null;
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const u = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
    return u ?? null;
  },
});

export const getByPhoneNumber = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, { phoneNumber }) => {
    const u = await ctx.db
      .query("users")
      .withIndex("by_phoneNumber", (q) => q.eq("phoneNumber", phoneNumber))
      .unique();
    return u ?? null;
  },
});

// Convenience: get current user doc by email (pass from Clerk)
export const getMe = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const u = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .unique();
    return u ?? null;
  },
});

// --- MUTATIONS ---

// Create only if email not present (soft-unique by email)
export const ensureUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, { email, name, username, phoneNumber }) => {
    const lower = email.toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", lower))
      .unique();
    
    if (existing) return existing._id;
    
    const id = await ctx.db.insert("users", {
      email: lower,
      name,
      username,
      phoneNumber,
    });
    return id;
  },
});

// Update fields by email (no-op if user doesn't exist)
export const updateByEmail = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, { email, name, username, phoneNumber }) => {
    const lower = email.toLowerCase();
    const u = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", lower))
      .unique();
    if (!u) return null;
    
    await ctx.db.patch(u._id, {
      ...(name !== undefined ? { name } : {}),
      ...(username !== undefined ? { username } : {}),
      ...(phoneNumber !== undefined ? { phoneNumber } : {}),
    });
    return u._id;
  },
});