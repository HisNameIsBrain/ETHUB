\"use client\";

import { useEffect, useMemo, useState } from \"react\";

type Entry = { name: string; kind: \"dir\" | \"file\" | \"other\"; relPath: string; size?: number };

async function apiList(relDir: string) {
  const r = await fetch(`/api/ftp/files/list?path=${encodeURIComponent(relDir)}`, { cache: \"no-store\" });
  return r.json();
}
async function apiRead(relFile: string) {
  const r = await fetch(`/api/ftp/files/read?path=${encodeURIComponent(relFile)}`, { cache: \"no-store\" });
  return r.json();
}
async function apiWrite(relFile: string, content: string) {
  const r = await fetch(`/api/ftp/files/write`, {
    method: \"POST\",
    headers: { \"Content-Type\": \"application/json\" },
    body: JSON.stringify({ path: relFile, content }),
  });
  return r.json();
}

export default function FtpFilesPage() {
  const [cwd, setCwd] = useState<string>(\"\");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string>(\"\");
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<string>(\"\");

  useEffect(() => {
    (async () => {
      setStatus(\"Loading…\");
      const data = await apiList(cwd);
      if (!data.ok) return setStatus(data.error || \"Failed\");
      setEntries(data.entries);
      setStatus(\"\");
    })();
  }, [cwd]);

  const breadcrumbs = useMemo(() => {
    const parts = cwd.split(\"/\").filter(Boolean);
    const out: { label: string; path: string }[] = [{ label: \"app\", path: \"\" }];
    let acc = \"\";
    for (const p of parts) {
      acc = acc ? `${acc}/${p}` : p;
      out.push({ label: p, path: acc });
    }
    return out;
  }, [cwd]);

  async function openFile(relPath: string) {
    setStatus(\"Opening…\");
    const data = await apiRead(relPath);
    if (!data.ok) return setStatus(data.error || \"Failed\");
    setSelected(relPath);
    setContent(data.content ?? \"\");
    setDirty(false);
    setStatus(\"\");
  }

  async function save() {
    if (!selected) return;
    setStatus(\"Saving…\");
    const data = await apiWrite(selected, content);
    if (!data.ok) return setStatus(data.error || \"Failed\");
    setDirty(false);
    setStatus(\"Saved\");
    setTimeout(() => setStatus(\"\"), 800);
  }

  return (
    <div className=\"flex h-[calc(100vh-64px)] gap-3 p-3\">
      <div className=\"w-[360px] shrink-0 rounded-xl border bg-background p-2\">
        <div className=\"mb-2 flex flex-wrap items-center gap-1 text-sm\">
          {breadcrumbs.map((b, i) => (
            <button
              key={b.path}
              className=\"rounded-md px-2 py-1 hover:bg-muted\"
              onClick={() => {
                if (dirty && !confirm(\"Discard unsaved changes?\")) return;
                setCwd(b.path);
                setSelected(null);
                setContent(\"\");
                setDirty(false);
              }}
            >
              {i === 0 ? \"app\" : `/${b.label}`}
            </button>
          ))}
        </div>

        <div className=\"space-y-1 text-sm\">
          {cwd && (
            <button
              className=\"w-full rounded-lg px-2 py-1 text-left hover:bg-muted\"
              onClick={() => {
                if (dirty && !confirm(\"Discard unsaved changes?\")) return;
                const up = cwd.split(\"/\").filter(Boolean);
                up.pop();
                setCwd(up.join(\"/\"));
              }}
            >
              .. (up)
            </button>
          )}

          {entries.map((e) => (
            <button
              key={e.relPath}
              className=\"flex w-full items-center justify-between rounded-lg px-2 py-1 text-left hover:bg-muted\"
              onClick={() => {
                if (e.kind === \"dir\") {
                  if (dirty && !confirm(\"Discard unsaved changes?\")) return;
                  setCwd(e.relPath);
                  setSelected(null);
                  setContent(\"\");
                  setDirty(false);
                } else if (e.kind === \"file\") {
                  if (dirty && !confirm(\"Discard unsaved changes?\")) return;
                  openFile(e.relPath);
                }
              }}
            >
              <span className=\"truncate\">
                {e.kind === \"dir\" ? \"📁 \" : e.kind === \"file\" ? \"📄 \" : \"❓ \"}{e.name}
              </span>
              {e.kind === \"file\" && typeof e.size === \"number\" ? (
                <span className=\"ml-2 text-xs text-muted-foreground\">{e.size}b</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className=\"flex min-w-0 flex-1 flex-col rounded-xl border bg-background\">
        <div className=\"flex items-center justify-between gap-2 border-b p-2\">
          <div className=\"min-w-0 truncate text-sm\">
            {selected ? selected : \"Select a file to edit\"}
            {dirty ? \" • unsaved\" : \"\"}
          </div>
          <div className=\"flex items-center gap-2\">
            <div className=\"text-xs text-muted-foreground\">{status}</div>
            <button
              className=\"rounded-lg border px-3 py-1 text-sm disabled:opacity-50\"
              onClick={save}
              disabled={!selected || !dirty}
            >
              Save
            </button>
          </div>
        </div>

        <textarea
          className=\"flex-1 w-full resize-none rounded-b-xl bg-transparent p-3 font-mono text-sm outline-none\"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setDirty(true);
          }}
          spellCheck={false}
          disabled={!selected}
        />
      </div>
    </div>
  );
}
