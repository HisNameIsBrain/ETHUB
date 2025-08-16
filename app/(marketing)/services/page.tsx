"use client";

import * as React from "react";
import { useQuery } from "convex/react";
// If you use codegen, you can instead:
// import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

export default function ServicesPage() {
  // If you use codegen: const raw = useQuery(api.services.getPublics) ?? [];
  const raw = useQuery("services:getPublics") ?? undefined; // undefined while loading
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Filter & stable data array
  const services = React.useMemo(() => {
    const list = Array.isArray(raw) ? raw : [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((s: any) =>
      (s.name ?? "").toLowerCase().includes(term) ||
      (s.description ?? "").toLowerCase().includes(term)
    );
  }, [raw, q]);

  const total = services.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), lastPage);
  const startIndex = total > 0 ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = total > 0 ? Math.min(safePage * PAGE_SIZE, total) : 0;

  React.useEffect(() => {
    // if data changes or search term changes, clamp page back into range
    setPage((p) => Math.min(Math.max(1, p), Math.max(1, Math.ceil(services.length / PAGE_SIZE))));
  }, [q, services.length]);

  const pageItems =
    total > 0
      ? services.slice((safePage - 1) * PAGE_SIZE, (safePage - 1) * PAGE_SIZE + PAGE_SIZE)
      : [];

  const isLoading = raw === undefined;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Input
          placeholder="Search service"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <h1 className="text-3xl font-bold tracking-tight">Services</h1>
      <p className="mt-2 text-muted-foreground">
        Browse available services.
      </p>

      {/* Loading */}
      {isLoading && (
        <div className="mt-6 text-sm text-muted-foreground">Loading services…</div>
      )}

      {/* Empty */}
      {!isLoading && total === 0 && (
        <div className="mt-6 rounded-lg border p-6">
          <div className="text-base font-medium">No services found</div>
          <div className="text-sm text-muted-foreground">
            Try clearing your search or add some services in the admin panel.
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && total > 0 && (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((s: any) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">{s.name ?? "Untitled"}</TableCell>
                    <TableCell className="truncate max-w-[420px]">
                      {s.description ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          // TODO: push to details page when you have one
                          // router.push(`/services/${s.slug ?? s._id}`);
                          alert(`Selected: ${s.name ?? s._id}`);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing <span className="font-medium">{startIndex}</span>–
              <span className="font-medium">{endIndex}</span> of{" "}
              <span className="font-medium">{total}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹ Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={safePage >= lastPage}
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              >
                Next ›
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
