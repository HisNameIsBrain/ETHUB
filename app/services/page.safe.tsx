"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ServicesSafePage() {
  const data = useQuery(api.services.getPublicServices, { offset: 0, limit: 20 });
  const list = data?.services ?? [];
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Services</h1>
      <ul className="mt-4 space-y-2">
        {list.map((s: any) => <li key={s._id}>{s.name}</li>)}
      </ul>
    </div>
  );
}
