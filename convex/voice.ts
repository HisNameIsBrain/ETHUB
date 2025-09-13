// convex/voice.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const createSession = mutation({
  args: {
    userId: v.string(),
    model: v.optional(v.string()),
    device: v.optional(v.string()),
  },
  handler: async (ctx, { userId, model, device }) => {
    const now = Date.now();
    const id = await ctx.db.insert("voiceSessions", {
      userId,
      status: "active",
      model,
      device,
      startedAt: now,
    });
    return id as Id<"voiceSessions">;
  },
});

export const endSession = mutation({
  args: { sessionId: v.id("voiceSessions") },
  handler: async (ctx, { sessionId }) => {
    await ctx.db.patch(sessionId, { status: "ended", endedAt: Date.now() });
    return sessionId;
  },
});

export const appendLog = mutation({
  args: {
    sessionId: v.id("voiceSessions"),
    kind: v.union(v.literal("input"), v.literal("output"), v.literal("event")),
    payload: v.any(), // accepts string | object at callsite; we persist as JSON string
  },
  handler: async (ctx, { sessionId, kind, payload }) => {
    const createdAt = Date.now();
    const payloadJson =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    const id = await ctx.db.insert("voiceLogs", {
      sessionId,
      kind,
      payloadJson,
      createdAt,
    });
    return id;
  },
});

export const getLogsBySession = query({
  args: { sessionId: v.id("voiceSessions") },
  handler: async (ctx, { sessionId }) => {
    const rows = await ctx.db
      .query("voiceLogs")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
    rows.sort((a, b) => a.createdAt - b.createdAt);
    return rows.map((r) => ({
      ...r,
      payload: safeParse(r.payloadJson),
    }));
  },
});

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
