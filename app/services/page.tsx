"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { ServicesTable } from "@/components/services-table";
import { Spinner } from "@/components/spinner";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const services = useQuery(api.services.getPublics);

  if (services === undefined) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner size="lg" />
        <span className="ml-2">Loading services...</span>
      </div>
    );
  }

  if (services === null) {
    return (
      <div className="p-4 text-red-500">
        Failed to load services. Please try again later.
      </div>
    );
  }

  if (!Array.isArray(services)) {
    return (
      <div className="p-4 text-red-500">
        Unexpected data format received.
      </div>
    );
  }

  const filtered = services.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const servicesPerPage = 5;
  const paginated = filtered.slice(offset, offset + servicesPerPage);

  if (filtered.length === 0) {
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
        <p className="text-center text-gray-500 mt-4">No services found.</p>
      </div>
    );
  }

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
        isAdmin={false}
      />
    </div>
  );
}