"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import ServicesTable from "@/components/services/services-table";

const PAGE_SIZE = 10;

type Service = {
  _id: string;
  name?: string;
  description?: string;
  isPublished?: boolean;
};

export default function ServicesSafePage() {
  const raw = useQuery(api.services.getPublic) ?? undefined;

  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);

  const services = React.useMemo<Service[]>(() => {
    const list = Array.isArray(raw) ? (raw as Service[]) : [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((s) =>
      (s.name ?? "").toLowerCase().includes(term) ||
      (s.description ?? "").toLowerCase().includes(term)
    );
  }, [raw, q]);

  const total = services.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), lastPage);
  const offset = total > 0 ? (safePage - 1) * PAGE_SIZE : 0;

  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), Math.max(1, Math.ceil(services.length / PAGE_SIZE))));
  }, [q, services.length]);

  const pageItems = React.useMemo(
    () =>
      total > 0
        ? services
            .slice(offset, offset + PAGE_SIZE)
            .map((s) => ({ ...s, name: s.name ?? "Untitled" }))
        : [],
    [services, total, offset]
  );

  const isLoading = raw === undefined;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Input
          placeholder="Search services…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading && <div className="mt-6 text-sm text-muted-foreground">Loading services…</div>}

      {!isLoading && total === 0 && (
        <div className="mt-6 rounded-lg border p-6">
          <div className="text-base font-medium">No services found</div>
          <div className="text-sm text-muted-foreground">
            Try clearing your search or check back later.
          </div>
        </div>
      )}

      {!isLoading && total > 0 && (
        <ServicesTable
          services={pageItems as any}
          offset={offset}
          servicesPerPage={PAGE_SIZE}
          totalServices={total}
          onPageChange={(nextOffset) => {
            const nextPage = Math.floor(nextOffset / PAGE_SIZE) + 1;
            const clamped = Math.min(Math.max(1, nextPage), lastPage);
            setPage(clamped);
          }}
          autoAdvanceMs={4500}
        />
      )}
    </div>
  );
}
