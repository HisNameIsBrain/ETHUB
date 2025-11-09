import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * We’ll log “voice session” activity into assistantLogs (already in your schema).
 * If your app expects different export names, update imports accordingly.
 */

export const startSession = mutation({
  args: v.object({
    userId: v.optional(v.string()),
    modelUsed: v.optional(v.string()),
    prompt: v.optional(v.string())
  }),
  handler: async (ctx, { userId, modelUsed, prompt }) => {
    const now = Date.now();
    const id = await ctx.db.insert("assistantLogs", {
      userId,
      modelUsed,
      prompt: prompt ?? "voice:start",
      answer: undefined,
      ok: true,
      status: 200,
      code: "START",
      latencyMs: 0,
      createdAt: now
    });
    return id;
  }
});

export const appendTranscript = mutation({
  args: v.object({
    logId: v.id("assistantLogs"),
    chunk: v.string()
  }),
  handler: async (ctx, { logId, chunk }) => {
    const log = await ctx.db.get(logId);
    if (!log) throw new Error("Log not found");
    const answer = ((log as any).answer ?? "") + chunk;
    await ctx.db.patch(logId, { answer });
    return true;
  }
});

export const endSession = mutation({
  args: v.object({
    logId: v.id("assistantLogs"),
    ok: v.optional(v.boolean()),
    code: v.optional(v.string()),
    status: v.optional(v.number()),
    latencyMs: v.optional(v.number())
  }),
  handler: async (ctx, { logId, ok, code, status, latencyMs }) => {
    const log = await ctx.db.get(logId);
    if (!log) throw new Error("Log not found");
    await ctx.db.patch(logId, {
      ok: ok ?? true,
      code: code ?? "END",
      status: status ?? 200,
      latencyMs: latencyMs ?? (log as any).latencyMs ?? 0
    });
    return true;
  }
});

export const getLogs = query({
  args: v.object({
    userId: v.optional(v.string()),
    limit: v.optional(v.number())
  }),
  handler: async (ctx, { userId, limit }) => {
    let q = ctx.db.query("assistantLogs");
    if (userId) q = q.filter((qq) => qq.eq(qq.field("userId"), userId));
    return q.order("desc").take(limit ?? 200);
  }
});
