"use client";

import { useState } from "react";

export default function TerminalPage() {
  const [cmd, setCmd] = useState("");
  const [log, setLog] = useState<string>("");

  async function run() {
    const c = cmd.trim();
    if (!c) return;

    setLog((p) => p + `\n$ ${c}\n`);
    setCmd("");

    const r = await fetch("/api/terminal/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cmd: c }),
    });

    const data = await r.json();
    if (!data.ok) {
      setLog((p) => p + `Error: ${data.error}\n`);
      return;
    }
    if (data.stdout) setLog((p) => p + data.stdout);
    if (data.stderr) setLog((p) => p + data.stderr);
    setLog((p) => p + (p.endsWith("\n") ? "" : "\n"));
  }

  return (
    <div className="p-3">
      <div className="rounded-xl border bg-background">
        <pre className="h-[70vh] overflow-auto p-3 text-sm">{log || "Sandbox terminal (cwd: /app)"}</pre>
        <div className="flex gap-2 border-t p-2">
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") run();
            }}
            className="flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
            placeholder="Allowed: ls, npm, pnpm, git, grep… (no pipes/redirects)"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <button className="rounded-lg border px-3 py-2 text-sm" onClick={run}>
            Run
          </button>
        </div>
      </div>
    </div>
  );
}
