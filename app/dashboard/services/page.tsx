// app/(dashboard)/services/page.tsx
"use client";

import type { Route } from "next";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, PlusCircle, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ServicesTable } from "@/components/services-table";

const PAGE_SIZE = 20;

type Service = {
  _id: string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  deliveryTime?: string;
  currency?: string;
  priceCents?: number;
  price?: number;
  isPublic?: boolean;
  archived?: boolean;
  category?: string;     // <-- used for grouping
  createdAt?: number;
  updatedAt: number;
  createdBy?: string;
};

export default function DashboardServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const qParam = useMemo(() => (searchParams.get("q") ?? "").toString(), [searchParams]);
  const offsetParam = useMemo(() => Number(searchParams.get("offset") ?? 0), [searchParams]);

  const [q, setQ] = useState(qParam);
  useEffect(() => setQ(qParam), [qParam]);

  const [needle, setNeedle] = useState(qParam);
  useEffect(() => {
    const t = setTimeout(() => setNeedle(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const result = useQuery(api.services.fetch, {
    needle: needle || undefined,
    offset: Math.max(0, offsetParam),
    limit: PAGE_SIZE,
    sort: "created_desc",
    onlyPublic: true,
  });

  const createService = useMutation(api.services.create);

  const loading = result === undefined;
  const services = (result?.services as Service[]) ?? [];
  const totalServices = result?.total ?? 0;
  const newOffset = result?.offset ?? 0;

  const onCreate = () => {
    const p = createService({
      name: "Untitled",
      description: "",
      price: 0,
      isPublic: true,
      archived: false,
    }).then((serviceId: string) => router.push(`/services/${serviceId}` as Route));

    toast.promise(p, {
      loading: "Creating a new service...",
      success: "Service created!",
      error: "Failed to create a new service.",
    });
  };

  const onSearchChange = (value: string) => {
    setQ(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", value);
    params.set("offset", "0");
    router.push(`?${params.toString()}` as Route);
  };

  const onPageChange = (nextOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("offset", String(Math.max(0, nextOffset)));
    router.push(`?${params.toString()}` as Route);
  };

  const grouped = useMemo(() => {
    if (loading) return [];
    const map = new Map<string, Service[]>();
    for (const s of services) {
      const cat = (s.category || "Uncategorized").trim() || "Uncategorized";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    }
    const entries = Array.from(map.entries()).map(([cat, list]) => ({
      cat,
      list: list.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)),
    }));
    entries.sort((a, b) => a.cat.localeCompare(b.cat));
    return entries;
  }, [services, loading]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 px-4 overflow-x-auto overscroll-x-contain no-scrollbar">
          <Tabs defaultValue="all" className="min-w-max">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="px-3 py-1 text-xs">All</TabsTrigger>
              <TabsTrigger value="active" className="px-3 py-1 text-xs">Active</TabsTrigger>
              <TabsTrigger value="draft" className="px-3 py-1 text-xs">Draft</TabsTrigger>
              <TabsTrigger value="archived" className="px-3 py-1 text-xs">Archived</TabsTrigger>
            </TabsList>
            <TabsContent value="all" />
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Input
            className="h-8 text-sm w-full sm:w-64"
            placeholder="Search…"
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Button size="sm" variant="outline" className="h-8 px-2">
            <File className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Export</span>
          </Button>
          <Button size="sm" className="h-8 px-2" onClick={onCreate}>
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Add</span>
          </Button>
        </div>
      </div>

      {/* Mobile: grouped card grids */}
      <div className="md:hidden space-y-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-3 animate-pulse h-32" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-sm opacity-70">No services.</div>
        ) : (
          grouped.map(({ cat, list }) => (
            <section key={cat} className="space-y-2">
              <h3 className="text-xs font-semibold opacity-70">{cat}</h3>
              <div className="grid grid-cols-2 gap-3">
                {list.map((s) => (
                  <ServiceCard key={s._id} s={s} />
                ))}
              </div>
            </section>
          ))
        )}

        <Pager
          offset={newOffset}
          total={totalServices}
          onPrev={() => onPageChange(newOffset - PAGE_SIZE)}
          onNext={() => onPageChange(newOffset + PAGE_SIZE)}
        />
      </div>

      {/* Desktop: table + category column kept in table (unchanged) */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <ServicesTable
            loading={loading}
            services={services}
            offset={newOffset}
            servicesPerPage={PAGE_SIZE}
            totalServices={totalServices}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
}

function Pager({
  offset,
  total,
  onPrev,
  onNext,
}: {
  offset: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const atStart = offset <= 0;
  const atEnd = offset + PAGE_SIZE >= total;
  return (
    <div className="mt-3 flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={atStart}>
        Previous
      </Button>
      <Button variant="outline" size="sm" onClick={onNext} disabled={atEnd}>
        Next
      </Button>
    </div>
  );
}

function ServiceCard({ s }: { s: Service }) {
  const title = s.title || s.name || "Untitled";
  const currency = (s.currency || "USD").toUpperCase();
  const priceCents =
    typeof s.priceCents === "number"
      ? s.priceCents
      : typeof s.price === "number"
      ? Math.round((s.price as number) * 100)
      : 0;
  const numeric = (priceCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <Card className="p-3 w-full h-full overflow-hidden">
      <div className="text-sm font-semibold leading-snug line-clamp-2 min-w-0">
        {title}
      </div>

      <div className="mt-1 flex items-center gap-2">
        {s.deliveryTime ? (
          <span className="px-2 py-0.5 rounded-full bg-muted text-foreground/80 text-[11px] whitespace-nowrap">
            {s.deliveryTime}
          </span>
        ) : null}
        <span className="px-2 py-0.5 rounded-full bg-muted text-foreground/80 text-[11px] whitespace-nowrap">
          {s.isPublic ? (
            <span className="inline-flex items-center gap-1">
              <Globe className="h-3 w-3" /> Public
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3" /> Private
            </span>
          )}
        </span>
      </div>

      <div className="mt-1 text-sm font-medium">
        {currency}${numeric}
      </div>

      <div className="mt-2 text-xs text-foreground/70 line-clamp-3 break-words">
        {s.description?.trim() ? s.description : "No description."}
      </div>
    </Card>
  );
}


