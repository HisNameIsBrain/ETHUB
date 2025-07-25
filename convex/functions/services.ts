import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const getAll = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("services").collect();
  },
});

export const getById = query({
  args: {
    id: v.id("services"),
  },
  handler: async (ctx: QueryCtx, args: { id: string }) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.float(),
    deliveryTime: v.string(),
    serverCode: v.optional(v.string()),
    category: v.string(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      name: string;
      description: string;
      price: number;
      deliveryTime: string;
      serverCode?: string;
      category: string;
    }
  ) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    const now = Date.now();
    return await ctx.db.insert("services", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.float()),
    deliveryTime: v.optional(v.string()),
    serverCode: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      id: string;
      name?: string;
      description?: string;
      price?: number;
      deliveryTime?: string;
      serverCode?: string;
      category?: string;
    }
  ) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("services"),
  },
  handler: async (ctx: MutationCtx, args: { id: string }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
    return { success: true };
  },
});