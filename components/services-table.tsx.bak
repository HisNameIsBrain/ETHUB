"use client";

import * as React from "react";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Service = {
  _id: string;
  name: string;
  price?: number;
  description?: string;
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
  archived: boolean;
  slug: string;
};

type ServicesTableProps = {
  services: Service[];
  offset: number;
  servicesPerPage: number;
  totalServices: number;
  onPageChange?: (nextOffset: number) => void;
  autoAdvanceMs?: number;
  loading?: boolean;
  className?: string;
};

export function ServicesTable({
  services,
  offset,
  servicesPerPage,
  totalServices,
  onPageChange,
  autoAdvanceMs,
  loading,
  className,
}: ServicesTableProps) {
  const pageCount = Math.max(1, Math.ceil(totalServices / Math.max(1, servicesPerPage)));
  const currentPage = Math.min(pageCount, Math.floor(offset / Math.max(1, servicesPerPage)) + 1);

  const nextOffset = useMemo(() => {
    const nextPage = Math.min(pageCount, currentPage + 1);
    return (nextPage - 1) * servicesPerPage;
  }, [currentPage, pageCount, servicesPerPage]);

  const prevOffset = useMemo(() => {
    const prevPage = Math.max(1, currentPage - 1);
    return (prevPage - 1) * servicesPerPage;
  }, [currentPage, servicesPerPage]);

  useEffect(() => {
    if (!autoAdvanceMs || autoAdvanceMs <= 0 || !onPageChange || pageCount <= 1) return;
    const id = setInterval(() => {
      const next = currentPage >= pageCount ? 0 : nextOffset;
      onPageChange(next);
    }, autoAdvanceMs);
    return () => clearInterval(id);
  }, [autoAdvanceMs, currentPage, nextOffset, onPageChange, pageCount]);

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="rounded-md border">
          <div className="p-3 border-b text-sm font-medium">Services</div>
          <div className="divide-y">
            {Array.from({ length: servicesPerPage || 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="ml-auto h-4 w-28 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <Pager
          currentPage={currentPage}
          pageCount={pageCount}
          onPrev={() => onPageChange?.(prevOffset)}
          onNext={() => onPageChange?.(nextOffset)}
        />
      </div>
    );
  }

  if (!services?.length) {
    return (
      <div className={cn("w-full", className)}>
        <div className="rounded-md border">
          <div className="p-3 border-b text-sm font-medium">Services</div>
          <div className="p-8 text-center text-sm text-muted-foreground">
            No services found.
          </div>
        </div>
        <Pager
          currentPage={currentPage}
          pageCount={pageCount}
          onPrev={() => onPageChange?.(prevOffset)}
          onNext={() => onPageChange?.(nextOffset)}
        />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[240px]">Name</TableHead>
              <TableHead className="min-w-[100px]">Price</TableHead>
              <TableHead className="min-w-[160px]">Status</TableHead>
              <TableHead className="min-w-[180px] text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s._id} className={cn(s.archived && "opacity-60")}>
                <TableCell className="font-medium">
                  <div className="truncate">{s.name || &quot;Untitled&quot;}</div>
                  {s.description ? (
                    <div className="text-xs text-muted-foreground truncate">
                      {s.description}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell>{formatPrice(s.price)}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded px-2 py-0.5 text-xs border",
                      s.archived
                        ? "bg-muted text-muted-foreground"
                        : s.isPublic
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900"
                    )}
                  >
                    {s.archived ? &quot;Archived&quot; : s.isPublic ? &quot;Public&quot; : &quot;Private&quot;}
                  </span>
                </TableCell>
                <TableCell className="text-right">{formatDate(s.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pager
        currentPage={currentPage}
        pageCount={pageCount}
        onPrev={() => onPageChange?.(prevOffset)}
        onNext={() => onPageChange?.(nextOffset)}
      />
    </div>
  );
}

function Pager({
  currentPage,
  pageCount,
  onPrev,
  onNext,
}: {
  currentPage: number;
  pageCount: number;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-between text-sm">
      <div className="text-muted-foreground">
        Page {currentPage} of {pageCount}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!onPrev || currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!onNext || currentPage >= pageCount}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function formatPrice(p?: number) {
  if (p === undefined || p === null || Number.isNaN(p)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(p);
  } catch {
    return `$${p.toFixed(2)}`;
  }
}

function formatDate(ts?: number) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "—";
  }
}

export default ServicesTable;
