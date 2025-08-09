// app/(main)/(routes)/services/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ServicesTable } from "@/components/services-table";
import { Spinner } from "@/components/spinner";

export default function ServicesIndexPage() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const services = useQuery(api.services.getPublics);
  
  if (services === undefined) {
    return (
      <div className="h-screen w-full grid place-items-center bg-black text-white">
        <Spinner size="lg" />
        <div className="mt-2 text-white/60">Loading services…</div>
      </div>
    );
  }
  if (!Array.isArray(services)) {
    return (
      <div className="p-4 text-red-500">Failed to load services.</div>
    );
  }
  
  const filtered = services.filter((s) =>
    (s?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );
  
  const servicesPerPage = 5;
  const paginated = filtered.slice(offset, offset + servicesPerPage);
  
  return (
    <div className="p-4 space-y-4 bg-black min-h-screen text-white">
      <input
        className="w-full border border-white/20 bg-transparent px-3 py-2 rounded placeholder:text-white/40"
        placeholder="Search service"
        value={search}
        onChange={(e) => {
          setOffset(0);
          setSearch(e.target.value);
        }}
      />
      {filtered.length === 0 ? (
        <p className="text-center text-white/60 mt-4">No services found.</p>
      ) : (
        <ServicesTable
          services={paginated as any}
          offset={offset}
          servicesPerPage={servicesPerPage}
          totalServices={filtered.length}
          onPageChange={(next) => setOffset(next)}
        />
      )}
    </div>
  );
}