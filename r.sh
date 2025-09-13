#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
backup() { [ -f "$1" ] && cp "$1" "$1.bak.$TS" && echo "Backed up $1 -> $1.bak.$TS" || true; }

echo "==> Updating Convex voice functions (including optional utilities)"
backup convex/voice.ts
cat > convex/voice.ts <<'TS'
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- Core: create, log, end, read
export const startSession = mutation({
  args: {
    model: v.optional(v.string()),
    ua: v.optional(v.string()),
    path: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { model, ua, path, userId }) => {
    const sessionId = await ctx.db.insert("voiceSessions", {
      model, ua, path, userId,
      startedAt: Date.now(),
      status: "open",
    });
    await ctx.db.insert("voiceLogs", {
      sessionId,
      ts: Date.now(),
      type: "session_open",
      payload: { model },
    });
    return { sessionId };
  },
});

export const logEvent = mutation({
  args: {
    sessionId: v.id("voiceSessions"),
    type: v.string(),
    payload: v.optional(v.any()),
  },
  handler: async (ctx, { sessionId, type, payload }) => {
    const exists = await ctx.db.get(sessionId);
    if (!exists) throw new Error("Unknown session");
    await ctx.db.insert("voiceLogs", { sessionId, ts: Date.now(), type, payload });
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
    await ctx.db.patch(sessionId, { endedAt: Date.now(), status: "closed" });
    await ctx.db.insert("voiceLogs", {
      sessionId, ts: Date.now(), type: "session_close", payload: { reason },
    });
    return { ok: true };
  },
});

export const getSessionLogs = query({
  args: { sessionId: v.id("voiceSessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("voiceLogs")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .take(200);
  },
});

// --- Convenience: list sessions (newest first) with optional user filter
export const listSessions = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 50 }) => {
    const q = userId
      ? ctx.db.query("voiceSessions").withIndex("by_user", (x) => x.eq("userId", userId))
      : ctx.db.query("voiceSessions").withIndex("by_startedAt", (x) => x.gt("startedAt", 0));
    return await q.order("desc").take(limit);
  },
});

// --- Quick stats (last 7 days)
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("voiceSessions")
      .withIndex("by_startedAt", (q) => q.gt("startedAt", sevenDaysAgo))
      .order("desc")
      .take(1000);

    const total = sessions.length;
    const closed = sessions.filter(s => s.endedAt).length;
    const avgDurationMs = (() => {
      const finished = sessions.filter(s => s.endedAt);
      if (!finished.length) return 0;
      const sum = finished.reduce((acc, s) => acc + ((s.endedAt as number) - s.startedAt), 0);
      return Math.round(sum / finished.length);
    })();

    return { total, closed, avgDurationMs, sessions };
  },
});

// --- Admin: clear one session (delete logs + session)
export const clearSession = mutation({
  args: { sessionId: v.id("voiceSessions") },
  handler: async (ctx, { sessionId }) => {
    const logs = await ctx.db
      .query("voiceLogs")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .take(10000);
    for (const l of logs) await ctx.db.delete(l._id);
    await ctx.db.delete(sessionId);
    return { ok: true };
  },
});

// --- OPTIONAL: batch log events (useful for streaming captions)
export const logBatch = mutation({
  args: {
    sessionId: v.id("voiceSessions"),
    items: v.array(
      v.object({
        type: v.string(),
        payload: v.optional(v.any()),
        ts: v.optional(v.number()),
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
        ts: it.ts ?? now,
        type: it.type,
        payload: it.payload,
      });
    }
    return { ok: true };
  },
});

// --- OPTIONAL: recent logs filtered by type (last 24h)
export const findRecentByType = query({
  args: { type: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { type, limit = 200 }) => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const many = await ctx.db
      .query("voiceLogs")
      .withIndex("by_ts", (q) => q.gt("ts", since))
      .order("desc")
      .take(5000);
    return many.filter((l) => l.type === type).slice(0, limit);
  },
});
TS

echo "==> Creating analytics page at app/dashboard/voice-analytics/page.tsx"
mkdir -p app/dashboard/voice-analytics
backup app/dashboard/voice-analytics/page.tsx
cat > app/dashboard/voice-analytics/page.tsx <<'TS'
"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Helpers
function msToHMS(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${ss}s`;
  return `${ss}s`;
}

function dayKey(ts: number) {
  const d = new Date(ts);
  return format(d, "yyyy-MM-dd");
}

export default function VoiceAnalyticsPage() {
  // Core stats (includes recent sessions array)
  const stats = useQuery(api.voice.getStats, {});
  // Recent errors in last 24h
  const recentErrors = useQuery(api.voice.findRecentByType, { type: "error", limit: 50 });
  // Latest sessions (fallback list)
  const recentSessions = useQuery(api.voice.listSessions, { limit: 50 });

  const [selectedSession, setSelectedSession] = React.useState<string | null>(null);
  const logs = useQuery(
    api.voice.getSessionLogs,
    selectedSession ? { sessionId: selectedSession as any } : "skip"
  );

  // Aggregate sessions/day (last 7 days) from stats.sessions
  const sessionsPerDay = React.useMemo(() => {
    const map = new Map<string, number>();
    const base = stats?.sessions ?? [];
    for (const s of base) {
      const k = dayKey(s.startedAt);
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    const days: { day: string; count: number }[] = [];
    // build 7-day axis
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const k = format(d, "yyyy-MM-dd");
      days.push({ day: format(d, "MMM d"), count: map.get(k) ?? 0 });
    }
    return days;
  }, [stats?.sessions]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Voice Analytics</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Sessions (7d)</div>
          <div className="text-2xl font-semibold">{stats ? stats.total : "…"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Closed rate</div>
          <div className="text-2xl font-semibold">
            {stats ? `${Math.round((stats.closed / Math.max(1, stats.total)) * 100)}%` : "…"}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Avg duration</div>
          <div className="text-2xl font-semibold">{stats ? msToHMS(stats.avgDurationMs) : "…"}</div>
        </Card>
      </div>

      {/* Sessions per day */}
      <Card className="p-4">
        <div className="mb-3 font-medium">Sessions per Day (last 7 days)</div>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={sessionsPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent errors */}
      <Card className="p-4">
        <div className="mb-3 font-medium">Recent Errors (24h)</div>
        <div className="space-y-2">
          {!recentErrors ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : recentErrors.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent errors 🎉</div>
          ) : (
            recentErrors.map((e: any) => (
              <div key={e._id} className="text-sm border rounded p-2 flex justify-between gap-4">
                <div className="truncate">
                  <div className="text-xs text-muted-foreground">
                    {new Date(e.ts).toLocaleString()}
                  </div>
                  <div className="truncate">
                    {typeof e.payload?.message === "string"
                      ? e.payload.message
                      : JSON.stringify(e.payload)}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedSession(e.sessionId)}>
                  View Session
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Sessions list */}
      <Card className="p-4">
        <div className="mb-3 font-medium">Recent Sessions</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {(stats?.sessions ?? recentSessions ?? []).map((s: any) => (
            <button
              key={s._id}
              onClick={() => setSelectedSession(s._id)}
              className="text-left border rounded p-3 hover:bg-accent"
            >
              <div className="text-sm font-medium flex items-center gap-2">
                <span>{s.model ?? "model?"}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(s.startedAt).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {s.endedAt ? `Duration: ${msToHMS((s.endedAt as number) - s.startedAt)}` : "Open…"}
              </div>
              <div className="text-xs text-muted-foreground">
                {s.userId ? `User: ${s.userId}` : "Anon"}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Drawer-ish inline panel for selected session */}
      {selectedSession && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Session Logs</div>
            <Button size="sm" variant="ghost" onClick={() => setSelectedSession(null)}>
              Close
            </Button>
          </div>
          {!logs ? (
            <div className="text-sm text-muted-foreground mt-2">Loading logs…</div>
          ) : logs.length === 0 ? (
            <div className="text-sm text-muted-foreground mt-2">No logs.</div>
          ) : (
            <div className="mt-2 space-y-2 max-h-[40vh] overflow-auto">
              {logs.map((l: any) => (
                <div key={l._id} className="text-sm border rounded p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-xs">{l.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(l.ts).toLocaleString()}
                    </div>
                  </div>
                  {l.payload ? (
                    <pre className="mt-1 text-xs whitespace-pre-wrap break-words">
                      {typeof l.payload === "string" ? l.payload : JSON.stringify(l.payload, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
TS

echo "==> Done. Now run:"
echo "   pnpm add recharts"
echo "   pnpm convex codegen && pnpm convex deploy"
echo "   pnpm dev"
TS
