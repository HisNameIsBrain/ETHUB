import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPublishedList = query({
  args: {},
  handler: async (ctx) => {
    const journeys = await ctx.db
      .query("mcJourneys")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("asc")
      .collect();

    return journeys;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const [journey] = await ctx.db
      .query("mcJourneys")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .take(1);

    return journey ?? null;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    slug: v.string(),
    title: v.string(),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    year: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("mcJourneys", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("mcJourneys"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    year: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) return;
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("mcJourneys") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
