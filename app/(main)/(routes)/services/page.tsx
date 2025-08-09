// app/services/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  // If your query is named getPublicServices, swap it back here:
  const services = useQuery(api.services.getPublics);
  
  // Loading
  if (services === undefined) {
    return (
      <div className="min-h-screen grid place-items-center bg-black text-white">
        <div className="opacity-70">Loading services…</div>
      </div>
    );
  }
  
  // Error guard
  if (!Array.isArray(services)) {
    return (
      <div className="p-4 text-red-500">
        Failed to load services.
      </div>
    );
  }
  
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return services.filter((s: any) =>
      (s?.name ?? "").toLowerCase().includes(term)
    );
  }, [services, search]);
  
  const currency = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
  
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <input
        className="w-full border border-white/20 bg-transparent px-3 py-2 mb-4 rounded placeholder:text-white/40"
        placeholder="Search service"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left">
          <thead className="bg-black/70 backdrop-blur border-b border-white/10">
            <tr className="text-xs uppercase tracking-wider text-white/60">
              <th className="p-3">Service</th>
              <th className="p-3">Delivery</th>
              <th className="p-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s: any) => {
              const id = String(s._id);
              const price =
                typeof s.price === "number" ? currency.format(s.price) : "—";
              const delivery =
                s.deliveryTime ?? s.delivery ?? "—";

              return (
                <tr
                  key={id}
                  className="border-b border-white/10 hover:bg-white/5 transition"
                >
                  <td className="p-3">
                    <Link
                      href={`/services/${id}`}
                      className="underline underline-offset-4 hover:opacity-80"
                      prefetch
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="p-3">{delivery}</td>
                  <td className="p-3 text-right">{price}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-white/60">
                  No services found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}