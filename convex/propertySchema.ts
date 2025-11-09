// convex/propertySchemas.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    fields: v.array(
      v.object({
        key: v.string(),
        name: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("number"),
          v.literal("select"),
          v.literal("multi_select"),
          v.literal("checkbox"),
          v.literal("date"),
          v.literal("url"),
          v.literal("files"),
          v.literal("relation")
        ),
        options: v.optional(v.array(v.object({ id: v.string(), name: v.string(), color: v.optional(v.string()) }))),
        relation: v.optional(v.object({ table: v.literal("documents") })),
        required: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("unauthorized");
    return await ctx.db.insert("propertySchemas", { ...args, userId: idt.subject });
  },
});

export const get = query({
  args: { id: v.id("propertySchemas") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const addField = mutation({
  args: {
    id: v.id("propertySchemas"),
    field: v.object({
      key: v.string(),
      name: v.string(),
      type: v.union(
        v.literal("text"),
        v.literal("number"),
        v.literal("select"),
        v.literal("multi_select"),
        v.literal("checkbox"),
        v.literal("date"),
        v.literal("url"),
        v.literal("files"),
        v.literal("relation")
      ),
      options: v.optional(v.array(v.object({ id: v.string(), name: v.string(), color: v.optional(v.string()) }))),
      relation: v.optional(v.object({ table: v.literal("documents") })),
      required: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, field }) => {
    const schema = await ctx.db.get(id);
    if (!schema) throw new Error("not found");
    await ctx.db.patch(id, { fields: [...schema.fields, field] });
    return id;
  },
});
