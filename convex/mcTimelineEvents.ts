import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPublicTimeline = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const events = await ctx.db
      .query("mcTimelineEvents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();

    return events;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    year: v.string(),
    title: v.string(),
    body: v.string(),
    tweetUrl: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("mcTimelineEvents", {
      ...args,
      createdAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("mcTimelineEvents"),
    year: v.optional(v.string()),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    tweetUrl: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) return;
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("mcTimelineEvents") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
