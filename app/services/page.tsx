// app/services/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const services = useQuery(api.services.getPublicServices);
  
  const filtered = services?.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="p-4">
      <input
        className="w-full border px-3 py-2 mb-4 rounded"
        placeholder="Search service"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table className="w-full text-left border">
        <thead className="bg-red-600 text-white">
          <tr>
            <th className="p-2">Service</th>
            <th className="p-2">Delivery</th>
            <th className="p-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {filtered?.map((s) => (
            <tr key={s._id} className="border-b hover:bg-gray-100">
              <td className="p-2">
                <Link href={`/services/${s._id}`} className="text-blue-600 underline">
                  {s.name}
                </Link>
              </td>
              <td className="p-2">{s.deliveryTime}</td>
              <td className="p-2">${s.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}