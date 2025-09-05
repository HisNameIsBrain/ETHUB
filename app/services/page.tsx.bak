"use client";
// app/(main)/dashboard/services/page.tsx
"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api"; // ← requires `npx convex codegen`
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

type Service = {
  _id: string;
  name?: string;
  description?: string;
  isPublished?: boolean;
};

export default function ServicesPage() {
  // Returns all if admin; else only published (see server query below)
  const raw = useQuery(api.services.getPublic) ?? undefined;

  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);

  const services = React.useMemo<Service[]>(() => {
    const list = Array.isArray(raw) ? (raw as Service[]) : [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(s =>
      (s.name ?? &quot;&quot;).toLowerCase().includes(term) ||
      (s.description ?? &quot;&quot;).toLowerCase().includes(term)
    );
  }, [raw, q]);

  const total = services.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), lastPage);
  const startIndex = total > 0 ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = total > 0 ? Math.min(safePage * PAGE_SIZE, total) : 0;

  React.useEffect(() => {
    setPage(p => Math.min(Math.max(1, p), Math.max(1, Math.ceil(services.length / PAGE_SIZE))));
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
          className=&quot;max-w-sm&quot;
        />
      </div>

      <h1 className="text-3xl font-bold tracking-tight">Services</h1>
      <p className="mt-2 text-muted-foreground">Browse available services.</p>

      {isLoading && <div className="mt-6 text-sm text-muted-foreground">Loading services…</div>}

      {!isLoading && total === 0 && (
        <div className="mt-6 rounded-lg border p-6">
          <div className="text-base font-medium">No services found</div>
          <div className="text-sm text-muted-foreground">
            Try clearing your search or add some services in the admin panel.
          </div>
        </div>
      )}

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
                {pageItems.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">{s.name ?? &quot;Untitled&quot;}</TableCell>
                    <TableCell className="truncate max-w-[420px]">
                      {s.description ?? &quot;—&quot;}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => alert(`Selected: ${s.name ?? s._id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing <span className="font-medium">{startIndex}</span>–
              <span className="font-medium">{endIndex}</span> of{&quot; &quot;}
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
