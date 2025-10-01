"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

export default function ServicesPage() {
  // String form works if your function name is exactly "services:getPublic"
  // If using codegen:
  const raw = useQuery(api.services.getAll) ?? undefined;

  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Normalize & filter
  const services = React.useMemo(() => {
    const list = Array.isArray(raw) ? raw : [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((s: any) =>
      (s.name ?? "").toLowerCase().includes(term) ||
      (s.description ?? "").toLowerCase().includes(term) ||
      (s.slug ?? "").toLowerCase().includes(term)
    );
  }, [raw, q]);

  // Paging math
  const total = services.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), lastPage);
  const startIndex = total > 0 ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = total > 0 ? Math.min(safePage * PAGE_SIZE, total) : 0;

  // Clamp page when filters/data change
  React.useEffect(() => {
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
      <p className="mt-2 text-muted-foreground">Browse available services.</p>

      {/* Loading */}
      {isLoading && (
        <div className="mt-6 text-sm text-muted-foreground">Loading services…</div>
      )}

      {/* Empty */}
      {!isLoading && total === 0 && (
        <div className="mt-6 text-sm text-muted-foreground">
          No services found{q ? " for your search." : "."}
        </div>
      )}

      {/* Table */}
      {!isLoading && total > 0 && (
        <div className="mt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Title</TableHead>
                <TableHead className="w-[45%]">Description</TableHead>
                <TableHead className="w-[15%]">Price</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((s: any) => (
                <TableRow key={s._id}>
                  <TableCell className="font-medium">{s.name ?? "Untitled"}</TableCell>
                  <TableCell className="truncate">
                    {(s.description ?? "").trim() || "—"}
                  </TableCell>
                  <TableCell>
                    {typeof s.price === "number" ? `$${s.price.toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Hook up real actions later */}
                    <Button variant="outline" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {startIndex > 0 ? (
                <>Showing {startIndex}–{endIndex} of {total}</>
              ) : (
                <>0 results</>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= lastPage}
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              >
                ›
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
