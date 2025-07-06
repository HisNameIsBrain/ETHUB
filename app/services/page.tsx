'use client';

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

import { Navbar } from "./_components/navbar";
import { SiriGlow } from "@/components/siri-glow";

type Service = {
  id: string;
  name: string;
  deliveryTime: string;
  price: string;
};

const initialServices: Service[] = [
  { id: "1", name: "Instant Unlock", deliveryTime: "Instant", price: "$16.00" },
  { id: "2", name: "Low Priority Unlock", deliveryTime: "1–2 Minutes", price: "$2.00" },
  { id: "3", name: "iPad WiFi-4G Unlock", deliveryTime: "2 min", price: "$8.00" },
  { id: "4", name: "Premium Unlock", deliveryTime: "0–1 min", price: "$14.00" },
  { id: "5", name: "Huawei iOS 10–13", deliveryTime: "0–2 min", price: "$6.00" },
  { id: "6", name: "iPhone X/XS/XS Max iOS", deliveryTime: "2–7 Days", price: "$54.00" },
  { id: "7", name: "Full Support 16.2–16.5", deliveryTime: "2–5 Days", price: "$59.00" },
];

export default function ServicesPage() {
  const { user, isLoaded } = useUser();
  const isAdmin = isLoaded && user?.emailAddresses[0].emailAddress.endsWith('@yourdomain.com');
  const [services, setServices] = useState<Service[]>(initialServices);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (id: string, field: keyof Service, value: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors">
      <SiriGlow />
      <Navbar isCollapsed={false} onResetWidth={function (): void {
        throw new Error("Function not implemented.");
      } } />
      <main className="pt-32 px-8">
        <h1 className="text-3xl font-bold mb-6">Service Table</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300 rounded-md">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border">Service</th>
                <th className="p-3 border">Delivery Time</th>
                <th className="p-3 border">Price</th>
                {isAdmin && <th className="p-3 border">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-3 border">
                    {editingId === service.id ? (
                      <input
                        value={service.name}
                        onChange={(e) =>
                          handleEdit(service.id, "name", e.target.value)
                        }
                        className="border px-2 py-1"
                      />
                    ) : (
                      <Link href={`/services/${service.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {service.name}
                      </Link>
                    )}
                  </td>
                  <td className="p-3 border">
                    {editingId === service.id ? (
                      <input
                        value={service.deliveryTime}
                        onChange={(e) =>
                          handleEdit(service.id, "deliveryTime", e.target.value)
                        }
                        className="border px-2 py-1"
                      />
                    ) : (
                      service.deliveryTime
                    )}
                  </td>
                  <td className="p-3 border">
                    {editingId === service.id ? (
                      <input
                        value={service.price}
                        onChange={(e) =>
                          handleEdit(service.id, "price", e.target.value)
                        }
                        className="border px-2 py-1"
                      />
                    ) : (
                      service.price
                    )}
                  </td>
                  {isAdmin && (
                    <td className="p-3 border">
                      {editingId === service.id ? (
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(service.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}