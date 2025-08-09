"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { ServicesTable } from "@/components/services-table";
import { Spinner } from "@/components/spinner";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  
  const services = useQuery(api.services.getPublics); // ⬅️ name matches query
  
  if (services === undefined) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner size="lg" />
        <span className="ml-2">Loading services...</span>
      </div>
    );
  }
  
  // services is now an array
  const filtered = services.filter((s) =>
    (s.name ?? "").toLowerCase().includes(search.toLowerCase())
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
      {filtered.length === 0 ? (
        <p ="text-center text-gray-500 mt-4">No services found.</p>
      ) : (
        <ServicesTable
          services={paginated}
          offset={offset}
          servicesPerPage={servicesPerPage}
          totalServices={filtered.length}
          isAdmin={false}
        />
      )}
    </div>
  );
};