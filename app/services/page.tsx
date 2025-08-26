"use client";
import * as React from "react";
import { useQuery } from "convex/react";
// If using codegen, switch to: import { api } from "@/convex/_generated/api";

const PAGE_SIZE = 10;

type Service = {
  _id: string;
  title?: string;
  description?: string;
};

export default function ServicesPageSafe() {
  // Using the string name keeps this drop-in; swap to api.services.getPublics if you have codegen.
  const raw = useQuery("services:getPublics") as Service[] | undefined;
  const isLoading = raw === undefined;
  const list: Service[] = Array.isArray(raw) ? raw : [];

  // query
  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((s) =>
      [s.title, s.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [q, list]);

  // pagination (safe math, no NaNs)
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const [page, setPage] = React.useState(1);
  const safePage = Math.min(Math.max(page, 1), pageCount);

  const start = total ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const end = total ? Math.min(total, safePage * PAGE_SIZE) : 0;

  const pageItems = React.useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  if (isLoading) {
    return (
      <main className="p-4">
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="mt-2">Browse available services.</p>
        <p className="mt-6 opacity-70">Loading services…</p>
      </main>
    );
  }

  return (
    <main className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <input
          aria-label="Search service"
          placeholder="Search service"
          className="border rounded px-3 py-2 w-72"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="text-sm opacity-70">
          {total === 0 ? "No results" : `Showing ${start}–${end} of ${total}`}
        </div>
      </div>

      {pageItems.length === 0 ? (
        <p className="opacity-80">No services yet.</p>
      ) : (
        <table className="w-full border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left font-semibold">
              <th className="px-2 py-1">Title</th>
              <th className="px-2 py-1">Description</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((s) => (
              <tr key={s._id} className="bg-white/5">
                <td className="px-2 py-2">{s.title || "Untitled"}</td>
                <td className="px-2 py-2 opacity-80">
                  {s.description || "—"}
                </td>
                <td className="px-2 py-2">
                  {/* replace with your real actions */}
                  <button className="border rounded px-2 py-1 text-sm">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex gap-2 mt-4">
        <button
          className="border rounded px-3 py-1 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={safePage === 1}
        >
          Prev
        </button>
        <button
          className="border rounded px-3 py-1 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          disabled={safePage === pageCount}
        >
          Next
        </button>
      </div>
    </main>
  );
}
