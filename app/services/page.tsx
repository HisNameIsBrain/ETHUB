"use client";
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

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
  const { user, isLoaded } = useUser();
  const service = useQuery(api.services.getAllServices);
  
  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin';
  
  if (!service) {
    return <p>Loading services...</p>;
  }
  
  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors">
      <main className="pt-32 px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Service List</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {service.map((service: Service) => (
            <div
              key={service._id}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div>
                <Link
                  href={`/edit/${service._id}`}
                  className="text-xl font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {service.name}
                </Link>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Delivery Time: {service.deliveryTime}
                </p>
                <p className="mt-1 text-lg font-medium">${service.price.toFixed(2)}</p>
              </div>
              {isAdmin && (
                <div className="mt-4">
                  <Link
                    href={`/(admin)/edit/${service._id}`}
                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    Edit
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
