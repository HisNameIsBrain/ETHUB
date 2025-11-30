"use client";

import { TerminalSquare } from "lucide-react";

export default function TerminalPage() {
  return (
    <div className="flex h-[calc(100vh-80px)] flex-col rounded-2xl border border-white/5 bg-[radial-gradient(circle_at_top,#141934,#040513)] p-3 text-xs text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
      <header className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/90 text-sky-300 ring-1 ring-sky-500/50">
          <TerminalSquare className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xs font-semibold tracking-[0.16em] text-slate-100">
            TERMINAL
          </h1>
          <p className="text-[11px] text-slate-400">
            Embedded shell with WebSocket + PTY backend (admin-gated).
          </p>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-700/70 bg-slate-950/80">
        <p className="max-w-md text-center text-[11px] text-slate-500">
          TODO: Mount xterm.js here and connect to your{" "}
          <code className="rounded bg-slate-900/80 px-1">/api/terminal/socket</code> server.
        </p>
      </div>
    </div>
  );
}
