import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllPublic = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db
      .query("mcServerPlans")
      .order("asc")
      .collect();

    return plans;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const [plan] = await ctx.db
      .query("mcServerPlans")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .take(1);

    return plan ?? null;
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    shortTag: v.optional(v.string()),
    description: v.optional(v.string()),
    specs: v.optional(v.string()),
    maxPlayers: v.optional(v.number()),
    ramGb: v.optional(v.number()),
    storageGb: v.optional(v.number()),
    monthlyPriceUsd: v.optional(v.number()),
    isFeatured: v.optional(v.boolean()),
    sortIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("mcServerPlans", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("mcServerPlans"),
    name: v.optional(v.string()),
    shortTag: v.optional(v.string()),
    description: v.optional(v.string()),
    specs: v.optional(v.string()),
    maxPlayers: v.optional(v.number()),
    ramGb: v.optional(v.number()),
    storageGb: v.optional(v.number()),
    monthlyPriceUsd: v.optional(v.number()),
    isFeatured: v.optional(v.boolean()),
    sortIndex: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) return;
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("mcServerPlans") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
