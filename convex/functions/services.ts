import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const getById = query({
  args: { id: v.id("services") },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.string(),
    description: v.string(),
    price: v.string(),
  },
  handler: async ({ db }, args) => {
    await db.patch(args.id, {
      name: args.name,
      description: args.description,
      price: args.price,
      updatedAt: Date.now(),
    });
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.string(),
    deliveryTime: v.string(),
  },
  handler: async ({ db }, args) => {
    return await db.insert("services", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

