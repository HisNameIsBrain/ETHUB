// app/(dashboard)/dashboard/code/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  FileCode2,
  FolderTree,
  Folder,
  File,
  ArrowLeft,
  Save,
  RotateCw,
  RefreshCw,
} from "lucide-react";

// Monaco must be dynamically imported (no SSR)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type FileEntry = {
  name: string;
  isDir: boolean;
  size?: number;
  mtime?: number;
};

type ListResponse = {
  dir: string;
  entries: FileEntry[];
};

export default function CodeStudioPage() {
  const [dir, setDir] = useState<string>(".");
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loadingDir, setLoadingDir] = useState(false);

  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [initialContent, setInitialContent] = useState<string>("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [sideOpen, setSideOpen] = useState(true);

  const isDirty = currentFile !== null && content !== initialContent;

  // --- Helpers -------------------------------------------------------------

  const joinPath = (base: string, name: string) => {
    if (base === "." || base === "") return name;
    return `${base}/${name}`;
  };

  const parentDir = (p: string) => {
    if (p === "." || p === "") return ".";
    const parts = p.split("/").filter(Boolean);
    if (parts.length <= 1) return ".";
    return parts.slice(0, -1).join("/");
  };

  const displayPath = (p: string | null) => p ?? "No file selected";

  // --- Directory loading ---------------------------------------------------

  const loadDir = async (targetDir: string) => {
    try {
      setLoadingDir(true);
      const res = await fetch("/api/files/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dir: targetDir }),
      });
      if (!res.ok) {
        throw new Error(`Failed to list dir: ${res.status}`);
      }
      const json: ListResponse = await res.json();
      setDir(json.dir);
      // Sort: folders first, then files
      const sorted = [...json.entries].sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
      });
      setEntries(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDir(false);
    }
  };

  const reloadDir = () => loadDir(dir);

  // --- File loading / saving ----------------------------------------------

  const loadFile = async (filePath: string) => {
    try {
      setLoadingFile(true);
      const res = await fetch("/api/files/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: filePath }),
      });
      if (!res.ok) {
        throw new Error(`Failed to read file: ${res.status}`);
      }
      const json = await res.json();
      setCurrentFile(json.file);
      setContent(json.content ?? "");
      setInitialContent(json.content ?? "");
      setSaveError(null);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message ?? "Failed to load file");
    } finally {
      setLoadingFile(false);
    }
  };

  const saveFile = async () => {
    if (!currentFile) return;
    try {
      setSaving(true);
      setSaveError(null);
      const res = await fetch("/api/files/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: currentFile, content }),
      });
      if (!res.ok) {
        throw new Error(`Failed to write file: ${res.status}`);
      }
      setInitialContent(content);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message ?? "Failed to save file");
    } finally {
      setSaving(false);
    }
  };

  const revertChanges = () => {
    setContent(initialContent);
  };

  // --- Initial load --------------------------------------------------------

  useEffect(() => {
    loadDir(".");
  }, []);

  // --- Render --------------------------------------------------------------

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col rounded-2xl border border-white/5 bg-[radial-gradient(circle_at_top_left,#182244,#050713)] p-3 text-xs text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
      {/* HEADER */}
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-[0_0_22px_rgba(56,189,248,0.7)]">
            <FileCode2 className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xs font-semibold tracking-[0.16em] text-slate-100">
              CODE STUDIO
            </h1>
            <p className="text-[11px] text-slate-400">
              Monaco-based, repo-aware editor for your ETHUB files.
            </p>
          </div>
        </div>

        {/* Mobile toggle for sidebar */}
        <button
          onClick={() => setSideOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/60 px-2 py-1 text-[10px] text-slate-200 hover:border-sky-500/60 hover:text-sky-200 md:hidden"
        >
          <FolderTree className="h-3.5 w-3.5" />
          {sideOpen ? "Hide files" : "Show files"}
        </button>
      </header>

      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* FILE SIDEBAR */}
        {sideOpen && (
          <aside className="flex w-60 flex-col rounded-2xl border border-white/5 bg-slate-950/80 p-2 text-[11px] md:w-64">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900/80 text-sky-300">
                  <FolderTree className="h-3.5 w-3.5" />
                </span>
                <span className="font-semibold tracking-[0.16em] uppercase text-slate-400">
                  ETHUB FILES
                </span>
              </div>
              <button
                onClick={reloadDir}
                disabled={loadingDir}
                className="rounded-full border border-slate-700/80 bg-slate-950/80 p-1 text-slate-400 hover:border-sky-500/60 hover:text-sky-200 disabled:opacity-50"
                title="Reload directory"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>

            <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500">
              <div className="flex items-center gap-1">
                <span className="text-slate-600">path:</span>
                <span className="truncate font-mono text-slate-300">
                  {dir === "." ? "/ETHUB" : `/ETHUB/${dir}`}
                </span>
              </div>
            </div>

            <div className="mb-2 flex items-center gap-1">
              <button
                onClick={() => loadDir(parentDir(dir))}
                disabled={dir === "." || loadingDir}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1 text-[10px] text-slate-300 hover:border-sky-500/60 hover:text-sky-100 disabled:opacity-40"
              >
                <ArrowLeft className="h-3 w-3" />
                Up
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {loadingDir && (
                <div className="py-4 text-center text-[11px] text-slate-500">
                  Loading directory…
                </div>
              )}

              {!loadingDir && entries.length === 0 && (
                <div className="py-4 text-center text-[11px] text-slate-500">
                  No files here.
                </div>
              )}

              {!loadingDir &&
                entries.map((e) => {
                  const path = joinPath(dir, e.name);
                  const isActive = currentFile === path;
                  return (
                    <button
                      key={path}
                      onClick={() =>
                        e.isDir ? loadDir(path) : loadFile(path)
                      }
                      className={[
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition",
                        isActive
                          ? "bg-sky-600/30 text-sky-50"
                          : "text-slate-200 hover:bg-slate-900/80",
                      ].join(" ")}
                    >
                      <span className="text-slate-400">
                        {e.isDir ? "📁" : "📄"}
                      </span>
                      <span className="flex-1 truncate">{e.name}</span>
                    </button>
                  );
                })}
            </div>
          </aside>
        )}

        {/* EDITOR PANEL */}
        <section className="flex flex-1 flex-col rounded-2xl border border-white/5 bg-slate-950/70">
          {/* Editor header / status bar */}
          <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="truncate font-mono text-[11px] text-slate-300">
                  {displayPath(currentFile)}
                </span>
                {isDirty && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-200">
                    unsaved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="truncate">
                  {loadingFile
                    ? "Loading file…"
                    : saving
                    ? "Saving…"
                    : saveError
                    ? `Error: ${saveError}`
                    : currentFile
                    ? "Ready"
                    : "Select a file from the sidebar to begin."}
                </span>
              </div>
            </div>

            {/* actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={revertChanges}
                disabled={!isDirty}
                className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-950/80 px-2 py-1 text-[10px] text-slate-300 hover:border-amber-500/70 hover:text-amber-200 disabled:opacity-40"
              >
                <RotateCw className="h-3 w-3" />
                Revert
              </button>
              <button
                onClick={saveFile}
                disabled={!currentFile || !isDirty || saving}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-1 text-[10px] font-semibold text-white shadow-[0_0_18px_rgba(56,189,248,0.6)] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:shadow-none"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

          {/* Monaco editor */}
          <div className="flex-1 overflow-hidden">
            {currentFile ? (
              <MonacoEditor
                height="100%"
                theme="vs-dark"
                language={guessLanguage(currentFile)}
                value={content}
                onChange={(v) => setContent(v ?? "")}
                options={{
                  fontSize: 12,
                  minimap: { enabled: false },
                  smoothScrolling: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  lineNumbersMinChars: 3,
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-950/90">
                <p className="max-w-sm text-center text-[11px] text-slate-500">
                  Select a file from the <span className="font-semibold">ETHUB FILES</span> panel
                  to start editing. This editor is powered by{" "}
                  <span className="font-semibold">Monaco</span>, similar to VS Code, but designed
                  to run smoothly even on mobile.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// Simple language guess based on file extension
function guessLanguage(path: string | null): string {
  if (!path) return "plaintext";
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
  if (path.endsWith(".js") || path.endsWith(".jsx")) return "javascript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".sh")) return "shell";
  return "plaintext";
}
