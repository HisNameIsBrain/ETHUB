"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

const SessionsBarChart = dynamic(
  () => import("./voice-analytics-chart"), // ↓ created below
  { ssr: false }
);

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
    selectedSession ? ({ sessionId: selectedSession } as any) : "skip"
  );

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
          <div className="text-2xl font-semibold">
            {stats ? msToHMS(stats.avgDurationMs) : "…"}
          </div>
        </Card>
      </div>

      {/* Sessions per day (chart rendered client-only) */}
      <Card className="p-4">
        <div className="mb-3 font-medium">Sessions per Day (last 7 days)</div>
        <SessionsBarChart sessions={stats?.sessions ?? []} />
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
