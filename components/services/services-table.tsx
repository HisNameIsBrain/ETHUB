"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Route } from "next";
import { useMemo } from "react";

type Service = { _id: string; name: string; description?: string; price?: number };

type Props = {
  services: Service[];
  offset: number;
  servicesPerPage: number;
  totalServices: number;
  onPageChange?: (nextOffset: number) => void;
  autoAdvanceMs?: number;
};

export default function ServicesTable({
  services,
  offset,
  servicesPerPage,
  totalServices,
  onPageChange,
}: Props) {
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(totalServices / Math.max(1, servicesPerPage))),
    [totalServices, servicesPerPage]
  );
  const currentPage = Math.floor(offset / Math.max(1, servicesPerPage)) + 1;

  return (
    <Card className="bg-black text-white border border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle>Services</CardTitle>
        <CardDescription className="text-white/70">
          {totalServices} total • Page {currentPage} of {pageCount}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="divide-y divide-white/10">
          {services.map((s) => (
            <div key={s._id} className="flex items-center justify-between py-4">
              <section className="flex flex-col gap-1">
                <h3 className="text-base font-medium">{s.name}</h3>
                {s.description ? <p className="text-sm text-white/70 line-clamp-2">{s.description}</p> : null}
                {typeof s.price === "number" ? <p className="text-sm text-white/80">${s.price.toFixed(2)}</p> : null}
              </section>
              <div className="flex items-center gap-2">
                <Link href={`/main/services/${s._id}` as Route} prefetch>
                  <Button className="bg-white text-black hover:opacity-90">Buy</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-white/10">
        <Button
          variant="outline"
          className="border-white/20 text-white/90 hover:bg-white/10"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(Math.max(0, offset - servicesPerPage))}
        >
          Previous
        </Button>
        <span className="text-white/70">{currentPage} / {pageCount}</span>
        <Button
          variant="outline"
          className="border-white/20 text-white/90 hover:bg白/10"
          disabled={currentPage >= pageCount}
          onClick={() => onPageChange?.(Math.min(totalServices - 1, offset + servicesPerPage))}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
