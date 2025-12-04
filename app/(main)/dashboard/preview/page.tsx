"use client";

import { useState } from "react";
import { MonitorPlay, RefreshCw } from "lucide-react";

export default function PreviewPage() {
  const [key, setKey] = useState(0);
  const url = process.env.NEXT_PUBLIC_ETHUB_PREVIEW_URL || "http://localhost:3000";

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col rounded-2xl border border-white/5 bg-[radial-gradient(circle_at_top_left,#182244,#050713)] p-3 text-xs text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-[0_0_22px_rgba(56,189,248,0.7)]">
            <MonitorPlay className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xs font-semibold tracking-[0.16em] text-slate-100">
              LIVE PREVIEW
            </h1>
            <p className="text-[11px] text-slate-400">
              Embedded browser into your running ETHUB app or dev server.
            </p>
          </div>
        </div>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[11px] text-slate-200 hover:border-sky-500/60 hover:text-sky-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reload
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden rounded-xl border border-white/5 bg-slate-950/80">
        <iframe
          key={key}
          src={url}
          className="h-full w-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
