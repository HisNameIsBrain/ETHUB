"use client";

import type { Route } from "next";
import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServicesTable } from "@/components/services-table";
import { toast } from "sonner";

const PAGE_SIZE = 20;

type Service = {
  _id: string;
  slug?: string;
  name: string;
  description?: string;
  price?: number;          // dollars (float64 in schema)
  deliveryTime?: string;
  isPublic?: boolean;
  archived?: boolean;
  createdAt?: number;
  updatedAt: number;
  createdBy?: string;
};

export default function DashboardServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params
  const qParam = useMemo(() => (searchParams.get("q") ?? "").toString(), [searchParams]);
  const offsetParam = useMemo(() => Number(searchParams.get("offset") ?? 0), [searchParams]);

  // Local search UI state (mirrors qParam but debounced for UX)
  const [q, setQ] = useState(qParam);
  useEffect(() => setQ(qParam), [qParam]);

  // Debounce search input to avoid thrashing queries
  const [needle, setNeedle] = useState(qParam);
  useEffect(() => {
    const t = setTimeout(() => setNeedle(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  // Convex: fetch list (paged) using your services.fetch query
  const result = useQuery(api.services.fetch, {
    needle: needle || undefined,
    offset: Math.max(0, offsetParam),
    limit: PAGE_SIZE,
    sort: "created_desc",
    onlyPublic: true,
  });

  const createService = useMutation(api.services.create);

  // Derive table props
  const loading = result === undefined;
  const services = (result?.services as Service[]) ?? [];
  const totalServices = result?.total ?? 0;
  const newOffset = result?.offset ?? 0;

  // Handlers
  const onCreate = () => {
    const promise = createService({
      name: "Untitled",
      description: "",
      price: 0,
      isPublic: true,
      archived: false,
    }).then((serviceId: string) => router.push(`/services/${serviceId}` as Route));

    toast.promise(promise, {
      loading: "Creating a new service...",
      success: "Service created!",
      error: "Failed to create a new service.",
    });
  };

  const onSearchChange = (value: string) => {
    setQ(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", value);
    params.set("offset", "0"); // reset to first page on search
    router.push(`?${params.toString()}` as Route);
  };

  const onPageChange = (nextOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("offset", String(Math.max(0, nextOffset)));
    router.push(`?${params.toString()}` as Route);
  };

  return (
    <div className="space-y-4">
      {/* Header row with tabs + controls */}
      <div className="flex items-center justify-between gap-3">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="archived" className="hidden sm:flex">
              Archived
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" />
        </Tabs>

        <div className="ml-auto flex items-center gap-2">
          <Input
            className="w-64"
            placeholder="Search services…"
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1" onClick={onCreate}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Service
            </span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <ServicesTable
        loading={loading}
        services={services}
        offset={newOffset}
        servicesPerPage={PAGE_SIZE}
        totalServices={totalServices}
        onPageChange={onPageChange}
      />
    </div>
  );
}
