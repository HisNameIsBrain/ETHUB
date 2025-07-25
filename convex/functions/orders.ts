import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const getAll = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("orders").collect();
  },
});

export const getById = query({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx: QueryCtx, args: { id: string }) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    serviceId: v.id("services"),
    imei: v.string(),
    deviceModel: v.string(),
    customerId: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      serviceId: string;
      imei: string;
      deviceModel: string;
      customerId ? : string;
      status: string;
    }
  ) => {
    const now = Date.now();
    return await ctx.db.insert("orders", {
      ...args,
      createdAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("orders"),
    status: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      id: string;
      status ? : string;
    }
  ) => {
    const { id, status } = args;
    return await ctx.db.patch(id, {
      status,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx: MutationCtx, args: { id: string }) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});