import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async ({ db }) => {
    return await db.query("services").collect();
  },
});

export const getById = query({
  args: {
    id: v.id("services"),
  },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
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
  handler: async ({ db }, args) => {
    const now = Date.now();
    return await db.insert("services", {
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
  handler: async ({ db }, args) => {
    const { id, ...rest } = args;
    return await db.patch(id, {
      ...rest,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("services"),
  },
  handler: async ({ db }, { id }) => {
    await db.delete(id);
    return { success: true };
  },
});