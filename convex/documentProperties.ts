// convex/documentProperties.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("not found");
    const schema = doc.propertySchemaId ? await ctx.db.get(doc.propertySchemaId) : null;
    return { properties: doc.properties ?? {}, schema };
  },
});

export const patch = mutation({
  args: {
    id: v.id("documents"),
    patch: v.record(v.string(), v.any()),
  },
  handler: async (ctx, { id, patch }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("not found");
    const merged = { ...(doc.properties ?? {}), ...patch };
    await ctx.db.patch(id, { properties: merged });
    return id;
  },
});
