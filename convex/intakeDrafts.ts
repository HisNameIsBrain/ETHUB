import { query } from "./_generated/server";
import { v } from "convex/values";

export const listByStatus = query({
  args: v.object({
    status: v.optional(v.union(v.literal("draft"), v.literal("submitted"), v.literal("cancelled"))),
    limit: v.optional(v.number()),
  }),
  handler: async (ctx, { status, limit = 100 }) => {
    if (status) {
      return await ctx.db
        .query("intakeDrafts")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .take(limit);
    }
    return await ctx.db
      .query("intakeDrafts")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});
