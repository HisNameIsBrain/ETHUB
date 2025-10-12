import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Mutation: saveImages
 * Saves an array of image metadata associated with a specific search query.
 * Each image record includes a timestamp for cache management.
 */
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
    const now = Date.now();

    for (const img of args.images) {
      await ctx.db.insert("partImages", {
        query: args.query,
        cachedAt: now,
        title: img.title ?? "",
        link: img.link,
        mime: img.mime,
        thumbnail: img.thumbnail,
        contextLink: img.contextLink,
      });
    }
  },
});

/**
 * Query: getCachedImages
 * Retrieves cached images for a given query string, sorted by newest first.
 */
export const getCachedImages = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("partImages")
      .filter((q) => q.eq(q.field("query"), args.query))
      .order("desc")
      .collect();
  },
});
