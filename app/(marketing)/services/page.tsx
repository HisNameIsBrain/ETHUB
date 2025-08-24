"use client";

import * as React from "react";
import { useQuery } from "convex/react";

type Service = {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  slug: string;
  createdAt: number;
};

export default function ServicesPage() {
  const services = (useQuery("services:getPublics") as Service[] | undefined) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Services</h1>
      {services.length === 0 ? (
        <p className="text-muted-foreground">No services yet.</p>
      ) : (
        <ul className="space-y-3">
          {services.map((s) => (
            <li key={s._id} className="border rounded-lg p-4">
              <a href={`/services/${s._id}`} className="font-medium underline">
                {s.name}
              </a>
              {s.description ? <p className="mt-1 text-sm">{s.description}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
