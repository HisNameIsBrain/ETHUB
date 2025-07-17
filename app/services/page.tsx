'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react'; // ✅ Make sure this is present
import { api } from '@/convex/_generated/api';
import Link from 'next/link';

type Service = {
  _id: string;
  name: string;
  deliveryTime: string;
  price: number;
};

export default function ServicesPage() {
  const { user, isLoaded } = useUser();
  const services = useQuery(api.services.listAllServices); // ✅ good
  
  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin';
  
  if (!services) {
    return <p>Loading services...</p>;
  }
  
  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors">
      <main className="pt-32 px-8">
        <h1 className="text-3xl font-bold mb-6">Service List</h1>
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
              {services.map((service: Service) => (
                <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-3 border">
                    <Link
                      href={`/services/${service._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {service.name}
                    </Link>
                  </td>
                  <td className="p-3 border">{service.deliveryTime}</td>
                  <td className="p-3 border">${service.price}</td>
                  {isAdmin && (
                    <td className="p-3 border">
                      <Link
                        href={`/admin/services/${service._id}/edit`}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </Link>
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