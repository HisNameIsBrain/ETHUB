"use client";
import type { Route } from "next";

import * as React from "react";
import { useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServicesTable } from "@/components/services-table";
import { toast } from "sonner";

type Service = {
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

export default function DashboardServicesPage() {
  const PAGE_SIZE = 10;

  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = useMemo(() => (searchParams.get(&quot;q&quot;) ?? &quot;&quot;).toString(), [searchParams]);
  const offset = useMemo(() => Number(searchParams.get(&quot;offset&quot;) ?? 0), [searchParams]);

  const createService = useMutation(api.services.create);

  const [services, setServices] = useState<Service[]>([]);
  const [newOffset, setNewOffset] = useState<number>(0);
  const [totalServices, setTotalServices] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/services?search=${encodeURIComponent(q)}&offset=${offset}`,
          { cache: &quot;no-store&quot; }
        );
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = (await res.json()) as {
          services: Service[];
          newOffset: number;
          totalServices: number;
        };
        if (!cancelled) {
          setServices(data.services ?? []);
          setNewOffset(data.newOffset ?? 0);
          setTotalServices(data.totalServices ?? 0);
        }
      } catch {
        if (!cancelled) {
          toast.error(&quot;Failed to load services&quot;);
          setServices([]);
          setNewOffset(0);
          setTotalServices(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [q, offset]);

  const onCreate = () => {
    const promise = createService({
      name: &quot;Untitled&quot;,
      description: &quot;&quot;,
      price: 0,
      isPublic: true,
      archived: false,
    }).then((serviceId: string) => router.push(&quot;/services/${serviceId}&quot; as Route));

    toast.promise(promise, {
      loading: &quot;Creating a new service...&quot;,
      success: &quot;Service created!&quot;,
      error: &quot;Failed to create a new service.&quot;,
    });
  };

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="archived" className="hidden sm:flex">
            Archived
          </TabsTrigger>
        </TabsList>

        <div className="ml-auto flex items-center gap-2">
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

      <TabsContent value="all">
        <ServicesTable
          loading={loading}
          services={services}
          offset={newOffset}
          servicesPerPage={PAGE_SIZE}
          totalServices={totalServices}
          onPageChange={(nextOffset) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(&quot;offset&quot;, String(nextOffset));
            router.push(&quot;?${params.toString()}&quot; as Route);
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
