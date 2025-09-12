// convex/logs.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    userKeyHmac: v.optional(v.string()),
    promptHashHmac: v.optional(v.string()),
    modelUsed: v.optional(v.string()),
    promptRedacted: v.optional(v.string()),
    answerRedacted: v.optional(v.string()),
    ok: v.boolean(),
    status: v.optional(v.number()),
    code: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("assistantLogs", { ...args, createdAt: Date.now() });
    return true;
  },
});
