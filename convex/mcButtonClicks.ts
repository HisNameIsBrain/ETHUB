// convex/mcButtonClicks.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const logClick = mutation({
  args: {
    buttonKey: v.string(),
    path: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    userId: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("mcButtonClicks", {
      ...args,
      createdAt: now,
    });
  },
});
