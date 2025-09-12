"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell,
} from "@/components/ui/table";

export default function ServicesSafePage() {
  const raw = useQuery(api.services.getPublic) ?? [];
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return raw;
    return raw.filter((s: any) =>
      (s?.name ?? "").toLowerCase().includes(term) ||
      (s?.description ?? "").toLowerCase().includes(term)
    );
  }, [raw, q]);

  const PAGE_SIZE = 10;
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search services…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button onClick={() => setPage(1)}>Search</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((s: any) => (
            <TableRow key={s._id}>
              <TableCell>{s?.name ?? "Untitled"}</TableCell>
              <TableCell>{s?.description ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </Button>
        <span>Page {page}</span>
        <Button
          variant="outline"
          onClick={() =>
            setPage((p) => (start + PAGE_SIZE < filtered.length ? p + 1 : p))
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
}
