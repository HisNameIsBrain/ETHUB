import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveImages = mutation({
  args: {
    query: v.string(),
    images: v.array(
      v.object({
        link: v.string(),
        title: v.optional(v.string()),
        mime: v.optional(v.string()),
        thumbnail: v.optional(v.string()),
        contextLink: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const img of args.images) {
      await ctx.db.insert("images", { query: args.query, ...img });
    }
  },
});

export const getCachedImages = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("images")
      .filter((q) => q.eq(q.field("query"), args.query))
      .collect();
  },
});
