"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 10;

type IOSFile = {
  id: string;
  name: string;
  size: string | null;
  updatedAt: string | null;
  url: string | null;
};

export default function IOSFilesPage() {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<IOSFile[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/ios-files", { cache: "no-store" });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = await res.json();
        if (alive) setData(json.items as IOSFile[]);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const list = data ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        (f.size ?? "").toLowerCase().includes(term) ||
        (f.updatedAt ?? "").toLowerCase().includes(term)
    );
  }, [data, q]);

  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), lastPage);
  const offset = total > 0 ? (safePage - 1) * PAGE_SIZE : 0;
  const pageItems = filtered.slice(offset, offset + PAGE_SIZE);

  React.useEffect(() => {
    // clamp page if filter shrinks results
    setPage((p) => Math.min(Math.max(1, p), lastPage));
  }, [q, lastPage]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Input
          placeholder="Search iOS files…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading iOS files…</div>}

      {error && (
        <div className="rounded-lg border p-4 text-sm">
          <div className="font-medium">Failed to load</div>
          <div className="text-muted-foreground">{error}</div>
        </div>
      )}

      {!loading && !error && total === 0 && (
        <div className="rounded-lg border p-6">
          <div className="text-base font-medium">No files found</div>
          <div className="text-sm text-muted-foreground">
            Try clearing your search or check back later.
          </div>
        </div>
      )}

      {!loading && !error && total > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Size</th>
                <th className="p-2">Updated</th>
                <th className="p-2">Link</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((f) => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{f.name || "Untitled"}</td>
                  <td className="p-2">{f.size ?? "—"}</td>
                  <td className="p-2">{f.updatedAt ?? "—"}</td>
                  <td className="p-2">
                    {f.url ? (
                      <a href={f.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        Download
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <caption className="caption-bottom p-2 text-xs text-muted-foreground">
              Showing {offset + 1}-{Math.min(offset + PAGE_SIZE, total)} of {total}
            </caption>
          </table>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              className="rounded border px-3 py-1 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              Previous
            </button>
            <div>
              Page {safePage} / {lastPage}
            </div>
            <button
              className="rounded border px-3 py-1 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={safePage >= lastPage}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
