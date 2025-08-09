"use client";
import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ServicesTable } from "@/components/services-table";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const services = useQuery(api.services.getPublics, {});

  const filtered = useMemo(() => {
    if (!services) return [];
    const term = search.toLowerCase();
    return services.filter((s: any) => s.name?.toLowerCase().includes(term));
  }, [services, search]);

  return (
    <div className="p-4 space-y-4">
      <input
        className="w-full border px-3 py-2 rounded"
        placeholder="Search service"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ServicesTable services={filtered} />
    </div>
  );
}
