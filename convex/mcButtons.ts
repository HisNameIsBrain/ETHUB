import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByGroup = query({
  args: { group: v.string() },
  handler: async (ctx, { group }) => {
    const buttons = await ctx.db
      .query("mcButtons")
      .withIndex("by_group", (q) => q.eq("group", group))
      .order("asc")
      .collect();

    return buttons;
  },
});

export const create = mutation({
  args: {
    key: v.string(),
    label: v.string(),
    href: v.string(),
    variant: v.optional(v.string()),
    icon: v.optional(v.string()),
    group: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("mcButtons", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("mcButtons"),
    label: v.optional(v.string()),
    href: v.optional(v.string()),
    variant: v.optional(v.string()),
    icon: v.optional(v.string()),
    group: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) return;
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("mcButtons") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
