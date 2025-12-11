"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Session = {
  _id: string;
  startedAt: number; // epoch ms
};

function dayKey(ts: number) {
  const d = new Date(ts);
  return format(d, "yyyy-MM-dd");
}

export default function SessionsBarChart({ sessions }: { sessions: Session[] }) {
  const data = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions ?? []) {
      const k = dayKey(s.startedAt);
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    const days: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const k = format(d, "yyyy-MM-dd");
      days.push({ day: format(d, "MMM d"), count: map.get(k) ?? 0 });
    }
    return days;
  }, [sessions]);

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
