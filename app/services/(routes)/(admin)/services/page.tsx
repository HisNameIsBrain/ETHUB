"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type Service = {
  _id: Id < "serviceId" > ;
  name: string;
  description ? : string;
  price: number;
  deliveryTime: string;
  type ? : string;
  orgId ? : Id < "organizations" > ;
  isArchived ? : boolean;
};

export default function ServicesPage() {
  const services = useQuery(api.services.getAll);
  
  if (!services) {
    return <div className="p-4">Loading services...</div>;
  }
  
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Service List</h1>
      <ul className="space-y-4">
        {services.map((service: Service) => (
          <li
            key={service._id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{service.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {service.description || "No description provided"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${service.price}</p>
                <p className="text-xs text-muted-foreground">
                  {service.deliveryTime}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}