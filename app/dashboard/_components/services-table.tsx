"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Minimal, Convex-friendly shape for services. */
export type ServiceRow = {
  /** Prefer this when present to keep references stable across libs */
  serviceId?: string;           // your library key
  _id?: string;                 // Convex Id<"services">
  id?: string;                  // legacy fallback
  name: string;
  status?: "active" | "draft" | "archived" | string;
  price?: number | null;
  totalOrders?: number | null;  // analog to totalSales
  createdAt?: number | string | null;
  image?: string | null;
};

function formatMoney(n?: number | null) {
  if (n == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${typeof n === "number" ? n.toFixed(2) : n}`;
  }
}

function formatDate(d?: number | string | null) {
  if (!d && d !== 0) return "—";
  const date = typeof d === "number" ? new Date(d) : new Date(String(d));
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function statusVariant(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "active":
      return "default" as const;
    case "draft":
      return "secondary" as const;
    case "archived":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}

function ServiceRowView({
  service,
  onManage,
}: {
  service: ServiceRow;
  onManage?: (s: ServiceRow) => void;
}) {
  const img = service.image ?? "";
  return (
    <TableRow className="hover:bg-accent/50">
      <TableCell className="hidden w-[100px] sm:table-cell">
        {img ? (
          <img
            src={img}
            alt={service.name}
            className="aspect-square h-10 w-10 rounded-md object-cover ring-1 ring-border"
          />
        ) : (
          <div className="h-10 w-10 rounded-md bg-muted" />
        )}
      </TableCell>

      <TableCell className="font-medium">{service.name}</TableCell>

      <TableCell>
        <Badge variant={statusVariant(service.status)}>
          {service.status ?? "—"}
        </Badge>
      </TableCell>

      <TableCell className="hidden md:table-cell">
        {formatMoney(service.price ?? null)}
      </TableCell>

      <TableCell className="hidden md:table-cell">
        {service.totalOrders ?? 0}
      </TableCell>

      <TableCell className="hidden md:table-cell">
        {formatDate(service.createdAt ?? null)}
      </TableCell>

      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => onManage?.(service)}
        >
          Manage
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function ServicesTable({
  services,
  offset,
  totalServices,
  className,
  baseDetailPath = "/services", // where detail pages live, e.g. /services/[serviceId]
}: {
  services?: ServiceRow[] | null;
  offset: number;          // slice start index (0-based)
  totalServices: number;   // total count for pagination
  className?: string;
  /** If your details live elsewhere, override this (e.g. "/dashboard/services") */
  baseDetailPath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const pageSize = 5;

  const rows = Array.isArray(services) ? services : [];

  function prevPage() {
    const prev = Math.max(0, offset - pageSize);
    router.push(`${pathname}?offset=${prev}`, { scroll: false });
  }

  function nextPage() {
    const next = Math.min(
      Math.max(0, totalServices - ((totalServices % pageSize) || pageSize)),
      offset + pageSize
    );
    router.push(`${pathname}?offset=${next}`, { scroll: false });
  }

  // Prefer serviceId, then _id, then id for stable addressing
  function getKey(s: ServiceRow) {
    return String(s.serviceId ?? s._id ?? s.id ?? s.name);
  }

  function goToDetail(s: ServiceRow) {
    const id = s.serviceId ?? s._id ?? s.id;
    if (!id) return;
    router.push(`${baseDetailPath}/${id}`);
  }

  const start = totalServices === 0 ? 0 : Math.min(offset + 1, totalServices);
  const end = Math.min(offset + pageSize, totalServices);

  return (
    <Card className={cn("bg-card text-card-foreground", className)}>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>
          Manage your services and view their performance.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">Total Orders</TableHead>
              <TableHead className="hidden md:table-cell">Created at</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell className="py-6 text-sm text-muted-foreground" colSpan={7}>
                  No services yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((service) => (
                <ServiceRowView
                  key={getKey(service)}
                  service={service}
                  onManage={goToDetail}
                />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="bg-muted/30">
        <div className="flex w-full items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Showing <strong>{start}-{end}</strong> of{" "}
            <strong>{totalServices}</strong> services
          </div>
          <div className="flex">
            <Button
              onClick={prevPage}
              variant="ghost"
              size="sm"
              type="button"
              disabled={offset <= 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              onClick={nextPage}
              variant="ghost"
              size="sm"
              type="button"
              disabled={offset + pageSize >= totalServices}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
