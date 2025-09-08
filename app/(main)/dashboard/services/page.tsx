"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DashboardServices() {
  const data = useQuery(api.services.getPublicServices, { offset: 0, limit: 20 });
  const services = data?.services ?? [];
  const total = data?.total ?? 0;
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Services ({total})</h1>
      <ul className="mt-4 grid gap-2">
        {services.map((s: any) => (
          <li key={s._id} className="border rounded p-3">{s.name}</li>
        ))}
      </ul>
    </div>
  );
}
