import { buildServiceSearch } from "./lib/search";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- Helpers
function pack(kind: "input" | "output" | "event", type: string, payload?: any) {
  // We store logs as JSON strings: { type, ...payload }
  const obj = { type, ...(payload ?? {}) };
  return { kind, payloadJson: JSON.stringify(obj), createdAt: Date.now() };
};

// --- Core: create, log, end, read
export const startSession = mutation({
  args: {
    model: v.optional(v.string()),
    device: v.optional(v.string()),   // your schema uses 'device' (not 'ua')
    path: v.optional(v.string()),     // keep for payload context only
    userId: v.optional(v.string()),   // we'll coerce to non-empty
  },
  handler: async (ctx, { model, device, path, userId }) => {
    const uid = userId ?? "anon";     // REQUIRED by your schema
    const sessionId = await ctx.db.insert("voiceSessions", {
      userId: uid,
      model,
      device,
      startedAt: Date.now(),
      status: "active",               // your union: "active" | "ended"
      // (if your table stores 'path', add it to the table & codegen first)
    });

    await ctx.db.insert("voiceLogs", {
      sessionId,
      ...pack("event", "session_open", { model, path, device, userId: uid }),
    });

    return { sessionId };
  },
});

export const logEvent = mutation({
  args: {
    sessionId: v.id("voiceSessions"),
    type: v.string(),                 // semantic subtype inside payloadJson
    kind: v.optional(v.union(
      v.literal("input"),
      v.literal("output"),
      v.literal("event")
    )),
    payload: v.optional(v.any()),
  },
  handler: async (ctx, { sessionId, type, kind = "event", payload }) => {
    const exists = await ctx.db.get(sessionId);
    if (!exists) throw new Error("Unknown session");

    await ctx.db.insert("voiceLogs", {
      sessionId,
      ...pack(kind, type, payload),
    });

    return { ok: true };
  },
});

export const endSession = mutation({
  args: {
    sessionId: v.id("voiceSessions"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, reason }) => {
    const sess = await ctx.db.get(sessionId);
    if (!sess) return { ok: true };

    await ctx.db.patch(sessionId, { endedAt: Date.now(), status: "ended", status: "ended" }) });

    await ctx.db.insert("voiceLogs", {
      sessionId,
      ...pack("event", "session_close", { reason }),
    });

    return { ok: true };
  },
});

// Logs for a session (newest first)
export const getSessionLogs = query({
  args: { sessionId: v.id("voiceSessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("voiceLogs")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .take(200);
  },
});

// List recent sessions (optionally by user)
export const listSessions = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 50 }) => {
    if (userId) {
      return await ctx.db
        .query("voiceSessions")
        .withIndex("by_userId", (x) => x.eq("userId", userId))
        .order("desc")
        .take(limit);
    }
    // no by_startedAt index in your model: use system index for recency
    return await ctx.db
      .query("voiceSessions")
      .order("desc")
      .take(limit);
  },
});

// Quick stats (last 7 days) using system recency
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Pull a reasonable window (tune .take as needed)
    const sessions = await ctx.db
      .query("voiceSessions")
      .order("desc")
      .take(1000);

    const recent = sessions.filter((s) => s.startedAt >= sevenDaysAgo);
    const total = recent.length;
    const closed = recent.filter((s) => s.status === "ended" || s.endedAt).length;

    const finished = recent.filter((s) => s.endedAt);
    const avgDurationMs = finished.length
      ? Math.round(
          finished.reduce((acc, s) => acc + ((s.endedAt as number) - s.startedAt), 0) /
            finished.length
        )
      : 0;

    return { total, closed, avgDurationMs, sessions: recent };
  },
});

// Clear one session (delete logs + session)
export const clearSession = mutation({
  args: { sessionId: v.id("voiceSessions") },
  handler: async (ctx, { sessionId }) => {
    const logs = await ctx.db
      .query("voiceLogs")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .take(10000);
    for (const l of logs) await ctx.db.delete(l._id);

    await ctx.db.delete(sessionId);
    return { ok: true };
  },
});

// OPTIONAL: batch log events (useful for streaming captions)
export const logBatch = mutation({
  args: {
    sessionId: v.id("voiceSessions"),
    items: v.array(
      v.object({
        type: v.string(), // payload subtype for your analytics
        kind: v.optional(v.union(
          v.literal("input"),
          v.literal("output"),
          v.literal("event")
        )),
        payload: v.optional(v.any()),
        createdAt: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, { sessionId, items }) => {
    const exists = await ctx.db.get(sessionId);
    if (!exists) throw new Error("Unknown session");
    const now = Date.now();
    for (const it of items) {
      await ctx.db.insert("voiceLogs", {
        sessionId,
        ...pack(it.kind ?? "event", it.type, it.payload),
        // override createdAt if provided
        createdAt: it.createdAt ?? now,
      });
    }
    return { ok: true };
  },
});

// OPTIONAL: recent errors (last 24h). We parse payloadJson on the server.
export const findRecentByType = query({
  args: { type: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { type, limit = 200 }) => {
    const since = Date.now() - 24 * 60 * 60 * 1000;

    // Use sessionId index only when filtering by a single session; here we want recency:
    const many = await ctx.db
      .query("voiceLogs")
      .order("desc")
      .take(5000);

    // Filter by createdAt and payload.type
    const filtered = [];
    for (const l of many) {
      if (l.createdAt < since) break; // since it's ordered desc, can break early
      try {
        const obj = JSON.parse(l.payloadJson);
        if (obj?.type === type) filtered.push(l);
      } catch {
        // ignore bad JSON
      }
      if (filtered.length >= limit) break;
    }
    return filtered;
  },
});
