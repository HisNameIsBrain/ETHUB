"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function msToHMS(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${ss}s`;
  return `${ss}s`;
}

const SessionsBarChart = dynamic(() => import("./voice-analytics-chart"), {
  ssr: false,
});

export default function VoiceAnalyticsPage() {
  const logs = useQuery(api.voice.getLogs, { limit: 200 }) ?? [];
  const errors = logs.filter((l: any) => l.type === "error");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Voice Analytics</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Logs (limit 200)</div>
          <div className="text-2xl font-semibold">{logs.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Errors</div>
          <div className="text-2xl font-semibold">{errors.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Latest entry</div>
          <div className="text-2xl font-semibold">
            {logs[0]?._creationTime
              ? new Date(logs[0]._creationTime).toLocaleString()
              : "—"}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 font-medium">Sessions per Day (placeholder)</div>
        <SessionsBarChart sessions={[]} />
      </Card>

      <Card className="p-4">
        <div className="mb-3 font-medium">Recent Errors</div>
        <div className="space-y-2">
          {errors.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent errors 🎉</div>
          ) : (
            errors.map((e: any) => (
              <div key={e._id} className="text-sm border rounded p-2 flex justify-between gap-4">
                <div className="truncate">
                  <div className="text-xs text-muted-foreground">
                    {new Date(e._creationTime ?? Date.now()).toLocaleString()}
                  </div>
                  <div className="truncate">
                    {typeof e.payload?.message === "string"
                      ? e.payload.message
                      : JSON.stringify(e.payload)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-3 font-medium">Recent Logs</div>
        <div className="space-y-2 max-h-[40vh] overflow-auto">
          {logs.map((l: any) => (
              <div key={l._id} className="text-sm border rounded p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-xs">{l.type}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(l._creationTime ?? Date.now()).toLocaleString()}
                  </div>
                </div>
              {l.payload ? (
                <pre className="mt-1 text-xs whitespace-pre-wrap break-words">
                  {typeof l.payload === "string"
                    ? l.payload
                    : JSON.stringify(l.payload, null, 2)}
                </pre>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
