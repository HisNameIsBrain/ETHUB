"use client";

import { ShieldCheck } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-4 rounded-2xl border border-rose-500/40 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950/95 p-4 text-xs text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.75)]">
      <header className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-900/70 text-rose-200 ring-1 ring-rose-400/70">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xs font-semibold tracking-[0.16em] text-rose-100">
            ADMIN CONTROL
          </h1>
          <p className="text-[11px] text-slate-400">
            Admin-only overview of users, roles, and system health.
          </p>
        </div>
      </header>

      <p className="text-[11px] text-slate-500">
        TODO: Gate this route with an admin check and show metrics for Docker, SSH, Convex, and feature flags.
      </p>
    </div>
  );
}
