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