// convex/logs.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    prompt: v.optional(v.string()),
    answer: v.optional(v.string()),
    promptRedacted: v.optional(v.string()),
    answerRedacted: v.optional(v.string()),

    userId: v.optional(v.string()),
    userKeyHmac: v.optional(v.string()),
    promptHashHmac: v.optional(v.string()),
    modelUsed: v.optional(v.string()),
    ok: v.boolean(),
    status: v.optional(v.number()),
    code: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const prompt = args.prompt ?? args.promptRedacted ?? "";
    const answer = args.answer ?? args.answerRedacted;

    await ctx.db.insert("assistantLogs", {
      userId: args.userId,
      modelUsed: args.modelUsed,
      prompt,   
      answer,          
      ok: args.ok,
      status: args.status,
      code: args.code,
      latencyMs: args.latencyMs,
      createdAt: Date.now(),
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
    } as any);
    return true;
  },
});
