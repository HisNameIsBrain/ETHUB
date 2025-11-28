
"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { FolderTree, Save } from "lucide-react";

type Entry = {
  name: string;
  isDir: boolean;
};

export default function CodePage() {
  const [dir, setDir] = useState(".");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const loadDir = async (d: string) => {
    const res = await fetch("/api/files/list", {
      method: "POST",
      body: JSON.stringify({ dir: d }),
    });
    const json = await res.json();
    setDir(json.dir);
    setEntries(json.entries);
  };

  const loadFile = async (file: string) => {
    const res = await fetch("/api/files/read", {
      method: "POST",
      body: JSON.stringify({ file }),
    });
    const json = await res.json();
    setCurrentFile(json.file);
    setContent(json.content);
  };

  const saveFile = async () => {
    if (!currentFile) return;
    setSaving(true);
    await fetch("/api/files/write", {
      method: "POST",
      body: JSON.stringify({ file: currentFile, content }),
    });
    setSaving(false);
  };

  useEffect(() => {
    loadDir(".");
  }, []);

  return (
    <div className="flex h-[calc(100vh-80px)] rounded-2xl bg-[radial-gradient(circle_at_top_left,#182244,#050713)] p-3 text-xs text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
      <div className="flex w-60 flex-col rounded-2xl border border-white/5 bg-slate-950/80 p-2">
        <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/80 text-sky-300">
            <FolderTree className="h-3.5 w-3.5" />
          </span>
          <span className="font-semibold tracking-[0.16em] uppercase">
            ETHUB Files
          </span>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          {entries.map((e) => (
            <button
              key={e.name}
              onClick={() =>
                e.isDir
                  ? loadDir(dir === "." ? e.name : `${dir}/${e.name}`)
                  : loadFile(dir === "." ? e.name : `${dir}/${e.name}`)
              }
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-[11px] text-slate-200 hover:bg-slate-900/80"
            >
              <span className="text-slate-500">
                {e.isDir ? "📁" : "📄"}
              </span>
              <span className="truncate">{e.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ml-3 flex flex-1 flex-col rounded-2xl border border-white/5 bg-slate-950/70">
        <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
          <div className="text-[11px] text-slate-400">
            {currentFile ? currentFile : "Select a file…"}
          </div>
          <button
            onClick={saveFile}
            disabled={!currentFile || saving}
            className="flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-1 text-[11px] text-white shadow-[0_0_18px_rgba(56,189,248,0.6)] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:shadow-none"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            theme="vs-dark"
            language="typescript"
            value={content}
            onChange={(v) => setContent(v ?? "")}
            options={{
              fontSize: 12,
              minimap: { enabled: false },
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}

