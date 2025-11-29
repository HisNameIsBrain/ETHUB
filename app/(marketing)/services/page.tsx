"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

export default function ServicesPage() {
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
    setPage((p) =>
      Math.min(Math.max(1, p), Math.max(1, Math.ceil(services.length / PAGE_SIZE)))
    );
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

      {!isLoading && (
        <div className="mt-6 overflow-hidden rounded border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24 text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((svc: any) => (
                <TableRow key={svc._id}>
                  <TableCell className="font-medium">{svc.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {svc.description || "No description"}
                  </TableCell>
                  <TableCell className="text-right">
                    {svc.priceCents != null ? `$${(svc.priceCents / 100).toFixed(2)}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                    No services found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {startIndex}-{endIndex} of {total}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span>
            Page {safePage} of {lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= lastPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
