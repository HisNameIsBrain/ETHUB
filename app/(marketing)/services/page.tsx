"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function MarketingServices() {
  const data = useQuery(api.services.getPublicServices, { offset: 0, limit: 20 });
  const services = data?.services ?? [];
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Our Services</h1>
      <div className="mt-6 grid gap-3">
        {services.map((s: any) => (
          <div key={s._id} className="border rounded p-4">
            <h2 className="font-medium">{s.name}</h2>
            {s.description && <p className="text-muted-foreground">{s.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
