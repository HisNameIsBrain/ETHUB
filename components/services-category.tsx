"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Service = {
  _id: string;
  slug: string;
  name: string;
  category?: string;
  deliveryTime?: string;
  isPublic: boolean;
  archived: boolean;
  priceCents?: number;
  currency?: string;
  price?: number;
  description?: string;
  tags?: string[];
  updatedAt: number;
};

type Props = {
  services: Service[];
  /** keep the whole page visible: cap rows per category */
  rowsPerCategory?: number; // default 3
  className?: string;
};

export default function ServicesByCategory({
  services,
  rowsPerCategory = 10,
  className,
}: Props) {
  const groups = React.useMemo(() => groupByCategory(services), [services]);
  const categories = Object.keys(groups).sort((a, b) => a.localeCompare(b));

  return (
    <div
      className={cn(
        "w-full h-[calc(100vh-160px)] overflow-hidden", // never scroll
        "grid gap-4",
        // responsive grid so several tables fit on screen
        "grid-cols-1 md:grid-cols-2 2xl:grid-cols-3",
        className
      )}
    >
      {categories.map((cat) => {
        const rows = groups[cat] ?? [];
        const shown = rows.slice(0, Math.max(1, rowsPerCategory));
        const hidden = Math.max(0, rows.length - shown.length);

        return (
          <section key={cat} className="flex min-w-0 flex-col rounded-lg border">
            <header className="flex items-center justify-between gap-3 border-b px-4 py-2">
              <h2 className="truncate text-base font-semibold">{cat || "Uncategorized"}</h2>
              <Badge variant="secondary" className="text-xs">
                {rows.length} item{rows.length === 1 ? "" : "s"}
              </Badge>
            </header>

            <div className="flex-1 overflow-hidden"> {/* still no scroll; we cap rows */}
              <Table className="text-[0.98rem]">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="min-w-[200px]">Service</TableHead>
                    <TableHead className="min-w-[120px]">Delivery</TableHead>
                    <TableHead className="min-w-[96px]">Currency</TableHead>
                    <TableHead className="min-w-[128px]">Price (cents)</TableHead>
                    <TableHead className="min-w-[96px]">Public</TableHead>
                    <TableHead className="min-w-[160px]">Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shown.map((s) => {
                    const currency = s.currency ?? "USD";
                    const cents =
                      typeof s.priceCents === "number"
                        ? s.priceCents
                        : typeof s.price === "number"
                        ? Math.round(s.price * 100)
                        : undefined;

                    return (
                      <React.Fragment key={s._id}>
                        <TableRow className={cn(s.archived && "opacity-60")}>
                          <TableCell className="align-top">
                            <div className="font-semibold leading-snug truncate">{s.name || "Untitled"}</div>
                            <div className="text-xs text-muted-foreground truncate">{s.slug}</div>
                          </TableCell>
                          <TableCell className="align-top">
                            <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", deliveryBadgeClass(s.deliveryTime))}>
                              {s.deliveryTime ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant="secondary" className="text-xs">
                              {currency}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top">
                            <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                              {cents !== undefined ? cents.toLocaleString() : "—"}
                            </span>
                          </TableCell>
                          <TableCell className="align-top">
                            {statusBadge(s.isPublic, s.archived)}
                          </TableCell>
                          <TableCell className="align-top">
                            {!!s.tags?.length ? (
                              <div className="flex flex-wrap gap-1">
                                {s.tags.map((t) => (
                                  <Badge key={t} variant="secondary" className="text-[11px]">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>

                        <TableRow className={cn(s.archived && "opacity-60")}>
                          <TableCell colSpan={6} className="pt-0">
                            {s.description ? (
                              <div className="mt-2 rounded-md border bg-muted/20 p-3 text-sm leading-relaxed break-words whitespace-pre-wrap">
                                {s.description}
                              </div>
                            ) : (
                              <div className="mt-2 text-xs text-muted-foreground">No description.</div>
                            )}
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>

              {hidden > 0 && (
                <div className="flex items-center gap-2 border-t px-3 py-2 text-xs text-muted-foreground">
                  <ChevronRight className="h-3.5 w-3.5" />
                  {hidden} more hidden to keep the view onscreen
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* If there are no categories (no services), show an empty panel */}
      {categories.length === 0 && (
        <section className="flex min-w-0 flex-col rounded-lg border">
          <header className="border-b px-4 py-2">
            <h2 className="text-base font-semibold">Services</h2>
          </header>
          <div className="p-8 text-center text-sm text-muted-foreground">No services found.</div>
        </section>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function groupByCategory(rows: Service[]) {
  const map: Record<string, Service[]> = {};
  for (const s of rows) {
    const key = (s.category || "IMEI services").trim();
    if (!map[key]) map[key] = [];
    map[key].push(s);
  }
  // sort inside each category by updatedAt desc, then name
  for (const k of Object.keys(map)) {
    map[k].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0) || a.name.localeCompare(b.name));
  }
  return map;
}

function statusBadge(isPublic: boolean, archived: boolean) {
  if (archived)
    return <Badge variant="secondary" className="bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">Archived</Badge>;
  if (isPublic) return <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">Public</Badge>;
  return <Badge className="bg-amber-500 hover:bg-amber-500 text-white">Private</Badge>;
}

function deliveryBadgeClass(d?: string) {
  if (!d) return "bg-muted text-muted-foreground";
  const t = d.toLowerCase();
  if (t.includes("instant") || /(^|[^0-9])0-?1?\s*min/.test(t))
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
  if (t.includes("min"))
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200";
  if (t.includes("hour") || t.includes("day"))
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";
  return "bg-muted text-muted-foreground";
}
