import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCachedParts = query(async ({ db }, { brand, model, repairType }) => {
  const results = await db
    .query("partsPrice")
    .filter(q =>
      q.eq(q.field("brand"), brand)
      && q.eq(q.field("model"), model)
      && q.eq(q.field("repairType"), repairType)
    )
    .collect();

  return results;
});

export const savePart = mutation({
  args: {
    title: v.string(),
    image: v.optional(v.string()),
    partsPrice: v.optional(v.number()),
    labor: v.optional(v.number()),
    total: v.optional(v.number()),
    vendor: v.optional(v.string()),
    query: v.optional(v.string()), // optional: what user searched for
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("parts", { ...args });
  },
});

export const getPartsByQuery = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("parts")
      .filter((q) => q.eq(q.field("query"), args.query))
      .collect();
  },
});
