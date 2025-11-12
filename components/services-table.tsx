// components/services-table.tsx
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Service = {
  _id: string;
  name: string;
  description?: string;
  deliveryTime?: string;
  currency?: string;        // "USD"
  priceCents?: number;      // integer cents
  isPublic?: boolean;
  archived?: boolean;
  slug?: string;
  updatedAt?: number;
  tags?: string[];
  category?: string;
};

type Props = {
  services: Service[];
  offset: number;
  servicesPerPage: number;
  totalServices: number;
  onPageChange?: (nextOffset: number) => void;
  loading?: boolean;
  className?: string;
};

export function ServicesTable({
  services,
  offset,
  servicesPerPage,
  totalServices,
  onPageChange,
  loading,
  className,
}: Props) {
  const pageCount = Math.max(1, Math.ceil(totalServices / Math.max(1, servicesPerPage)));
  const currentPage = Math.min(pageCount, Math.floor(offset / Math.max(1, servicesPerPage)) + 1);
  const nextOffset = (Math.min(pageCount, currentPage + 1) - 1) * servicesPerPage;
  const prevOffset = (Math.max(1, currentPage - 1) - 1) * servicesPerPage;

  return (
    <div className={cn("w-full", className)}>
      {/* Header (desktop only) */}
      <div className="hidden md:grid grid-cols-[2fr_1.1fr_0.9fr_1.1fr_0.9fr_1fr] gap-4 px-4 py-2 text-sm text-muted-foreground">
        <div>Service</div>
        <div>Delivery</div>
        <div>Currency</div>
        <div>Price (cents)</div>
        <div>Public</div>
        <div>Tags</div>
      </div>

      <div className="space-y-3">
        {loading
          ? Array.from({ length: servicesPerPage || 10 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))
          : services.map((s) => <Row key={s._id} s={s} />)}
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

function Row({ s }: { s: Service }) {
  // Mobile: cards (CSS grid), Desktop: 6-column table-like row
  return (
    <div
      className={cn(
        "rounded-xl border bg-card",
        "p-4 md:px-4 md:py-3",
        // Desktop grid (table-like)
        "md:grid md:grid-cols-[2fr_1.1fr_0.9fr_1.1fr_0.9fr_1fr] md:items-center md:gap-4",
        // Mobile becomes a vertical stack; no inner scroll
        "flex flex-col gap-2"
      )}
    >
      {/* Service title + slug (desktop column 1, mobile top) */}
      <div className="min-w-0">
        <div className="font-semibold truncate">{s.name || "Untitled"}</div>
        {s.slug ? (
          <div className="text-xs text-muted-foreground break-all">{s.slug}</div>
        ) : null}
      </div>

      {/* Delivery */}
      <div className="md:justify-self-start">
        <Badge tone={toneForDelivery(s.deliveryTime)}>{s.deliveryTime || "—"}</Badge>
      </div>

      {/* Currency */}
      <div className="md:justify-self-start">
        <Pill>{s.currency || "USD"}</Pill>
      </div>

      {/* Price cents */}
      <div className="font-semibold text-blue-600 dark:text-blue-300 md:justify-self-start tabular-nums">
        {typeof s.priceCents === "number" ? s.priceCents.toLocaleString() : "—"}
      </div>

      {/* Public */}
      <div className="md:justify-self-start">
        <Badge
          tone={
            s.archived ? "muted" : s.isPublic ? "success" : "warning"
          }
        >
          {s.archived ? "Archived" : s.isPublic ? "Public" : "Private"}
        </Badge>
      </div>

      {/* Tags */}
      <div className="md:justify-self-start">
        {s.tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {s.tags.slice(0, 6).map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="rounded-md border px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>

      {/* Description: spans full width (always last, full row) */}
      <div className="md:col-span-6 pt-2 text-sm text-muted-foreground whitespace-pre-wrap">
        {s.description?.trim() ? s.description : "No description."}
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="rounded-xl border p-4 md:px-4 md:py-3 md:grid md:grid-cols-[2fr_1.1fr_0.9fr_1.1fr_0.9fr_1fr] md:gap-4">
      <div className="h-4 w-40 bg-muted rounded animate-pulse" />
      <div className="h-6 w-24 bg-muted rounded-full animate-pulse mt-2 md:mt-0" />
      <div className="h-6 w-14 bg-muted rounded-full animate-pulse mt-2 md:mt-0" />
      <div className="h-5 w-20 bg-muted rounded animate-pulse mt-2 md:mt-0" />
      <div className="h-6 w-16 bg-muted rounded-full animate-pulse mt-2 md:mt-0" />
      <div className="h-4 w-28 bg-muted rounded animate-pulse mt-2 md:mt-0" />
      <div className="h-4 w-3/4 bg-muted rounded animate-pulse col-span-full mt-3" />
    </div>
  );
}

/* ---------- Small utilities ---------- */

function Badge({
  children,
  tone = "muted",
}: React.PropsWithChildren<{ tone?: "muted" | "success" | "warning" }>) {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900"
      : tone === "warning"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900"
      : "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs border", toneClasses)}>
      {children}
    </span>
  );
}
function Pill({ children }: React.PropsWithChildren) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}
function toneForDelivery(s?: string): "muted" | "success" | "warning" {
  if (!s) return "muted";
  const t = s.toLowerCase();
  if (t.includes("instant") || t.includes("0-") || t.includes("min")) return "success";
  if (t.includes("day")) return "warning";
  return "muted";
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
    <div className="mt-3 flex items-center justify-between text-sm px-1 md:px-0">
      <div className="text-muted-foreground">
        Page {currentPage} of {pageCount}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={!onPrev || currentPage <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={!onNext || currentPage >= pageCount}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
