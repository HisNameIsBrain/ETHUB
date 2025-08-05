"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { ServicesTable } from "@/components/services-table";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  
  const services = useQuery(api.services.getPublicServices);
  
  // Loading state
  if (services === undefined) {
    return <div className="p-4">Loading services...</div>;
  }
  
  // Handle potential bad data
  if (!Array.isArray(services)) {
    return <div className="p-4 text-red-500">Failed to load services.</div>;
  }
  
  const filtered = services.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );
  
  const servicesPerPage = 5;
  const paginated = filtered.slice(offset, offset + servicesPerPage);
  
  return (
    <div className="p-4 space-y-4">
      <input
        className="w-full border px-3 py-2 rounded"
        placeholder="Search service"
        value={search}
        onChange={(e) => {
          setOffset(0);
          setSearch(e.target.value);
        }}
      />
      <ServicesTable
        services={paginated}
        offset={offset}
        servicesPerPage={servicesPerPage}
        totalServices={filtered.length}
        isAdmin={false} // toggle with Clerk if needed
      />
    </div>
  );
}