"use client";

import { Network } from "lucide-react";

export default function SshPage() {
  return (
    <div className="flex h-[calc(100vh-80px)] flex-col rounded-2xl border border-white/5 bg-[radial-gradient(circle_at_top_left,#1a1436,#050211)] p-3 text-xs text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
      <header className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/90 text-fuchsia-300 ring-1 ring-fuchsia-500/60">
          <Network className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xs font-semibold tracking-[0.16em] text-slate-100">
            SSH SESSIONS
          </h1>
          <p className="text-[11px] text-slate-400">
            Admin-only SSH access via a secured backend (ssh2 + PTY).
          </p>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-700/70 bg-slate-950/80">
        <p className="max-w-md text-center text-[11px] text-slate-500">
          TODO: List SSH targets from Convex and mount a terminal for each active session.
        </p>
      </div>
    </div>
  );
}
