"use client";

import * as React from "react";
import { useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServicesTable } from "@/components/services-table"; // adjust if needed
import { toast } from "sonner"; // or your toast lib

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
  // add fields you actually render in ServicesTable
};

export default function DashboardServicesPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = useMemo(() => (searchParams.get("q") ?? "").toString(), [searchParams]);
  const offset = useMemo(
    () => Number(searchParams.get("offset") ?? 0),
    [searchParams]
  );

  const createService = useMutation(api.services.create); // make sure this exists in Convex

  // Local state for table data
  const [services, setServices] = useState<Service[]>([]);
  const [newOffset, setNewOffset] = useState<number>(0);
  const [totalServices, setTotalServices] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch services from your API route (or change to your preferred client fetcher)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        // Implement /api/services to return { services, newOffset, totalServices }
        const res = await fetch(
          `/api/services?search=${encodeURIComponent(q)}&offset=${offset}`,
          { cache: "no-store" }
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
      } catch (err) {
        if (!cancelled) {
          toast.error("Failed to load services");
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
      name: "Untitled",
      description: "",
      price: 0,
      isPublic: true,
      archived: false,
      // add any required fields your convex function expects
    }).then((serviceId: string) => router.push(`/services/${serviceId}`));

    toast.promise(promise, {
      loading: "Creating a new service...",
      success: "Service created!",
      error: "Failed to create a new service.",
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
          totalServices={totalServices}
        />
      </TabsContent>
    </Tabs>
  );
}
