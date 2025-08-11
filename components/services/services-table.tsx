// components/services/services-table.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from "@/components/ui/card";
import {
  Table, TableHeader, TableHead, TableRow, TableBody
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Service = {
  _id: string;
  name: string;
  description?: string;
  price?: number;
};

export function ServicesTable({
  services,
  offset,
  servicesPerPage,
  totalServices,
  onPageChange,
  autoAdvanceMs = 4500,
}: {
  services: Service[];
  offset: number;
  servicesPerPage: number;
  totalServices: number;
  onPageChange?: (nextOffset: number) => void;
  autoAdvanceMs?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  const rows = useMemo(() => services ?? [], [services]);

  // auto-advance between the visible “rows”
  useEffect(() => {
    if (rows.length <= 1 || !autoAdvanceMs) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % rows.length), autoAdvanceMs);
    return () => clearInterval(id);
  }, [rows.length, autoAdvanceMs]);

  // smooth scroll to the current row
  useEffect(() => {
    const el = containerRef.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [index]);

  const canPrev = offset > 0;
  const canNext = offset + servicesPerPage < totalServices;

  return (
    <Card className="bg-black text-white border border-white/10">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Services</CardTitle>
            <CardDescription className="text-white/60">
              Browse available services. One at a time, like the Apple hero.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              disabled={!canPrev}
              onClick={() => onPageChange?.(Math.max(0, offset - servicesPerPage))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              disabled={!canNext}
              onClick={() =>
                onPageChange?.(Math.min(
                  totalServices - (totalServices % servicesPerPage || servicesPerPage),
                  offset + servicesPerPage
                ))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* table header like your black screenshot */}
        <Table className="mt-3">
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-white/60 uppercase">Title</TableHead>
              <TableHead className="text-white/60 uppercase">Description</TableHead>
              <TableHead className="text-white/60 uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </CardHeader>

      <CardContent className="p-0">
        {/* one-at-a-time “rows” with hero + table row */}
        <div
          ref={containerRef}
          className="max-h-[70vh] overflow-y-auto snap-y snap-mandatory"
        >
          {rows.map((s) => (
            <section key={s._id} className="snap-start min-h-[65vh] flex items-center px-4 py-10">
              <div className="w-full">
                {/* Apple-like hero */}
                <div className="text-center space-y-2">
                  <h2 className="text-4xl md:text-5xl font-semibold">{s.name}</h2>
                  <p className="text-white/70 text-lg md:text-xl">
                    {s.description || "Premium device service."}
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-3">
                    <Button
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                      onClick={() => alert(`Info about: ${s.name}`)}
                    >
                      ?
                    </Button>
                    <Link href={`/main/services/${s._id}`} prefetch>
                      <Button className="bg-white text-black hover:opacity-90">Buy</Button>
                    </Link>
                  </div>
                </div>

                {/* the black "row" */}
                <div className="mt-8 rounded-xl border border-white/12 overflow-hidden">
                  <div className="grid grid-cols-12">
                    <div className="col-span-4 border-r border-white/10 p-4">
                      <div className="text-sm text-white/60 uppercase">serviceId</div>
                      <div className="mt-1 font-mono text-sm break-all">{s._id}</div>
                    </div>
                    <div className="col-span-8 p-4">
                      <div className="text-sm text-white/60 uppercase">name</div>
                      <div className="mt-1">{s.name}</div>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          ))}
        </div>
      </CardContent>

      <CardFooter className="border-t border-white/10 flex items-center justify-between">
        <div className="text-xs text-white/60">
          Showing {Math.min(offset + 1, totalServices)}–
          {Math.min(offset + servicesPerPage, totalServices)} of {totalServices}
        </div>
      </CardFooter>
    </Card>
  );
}