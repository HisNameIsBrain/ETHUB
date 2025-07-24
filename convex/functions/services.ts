'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/';

export default function ServicesPage() {
  const params = useParams() as { serviceId ? : string };
  const router = useRouter();
  
  const serviceId = params.serviceId;
  
  const isValidId = typeof serviceId === 'string' && serviceId.length > 0;
  
  const service = useQuery(
    api.services.getServiceById,
    isValidId ? { id: serviceId as Id < 'services' > } : 'skip'
  );
  
  if (!isValidId) {
    return (
      <div className="p-4 text-red-600">
        No service ID provided or invalid format.
      </div>
    );
  }
  
  if (service === undefined) {
    return (
      <div className="p-4">
        Loading service…
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="p-4 text-gray-600">
        Service not found.
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-blue-600 underline hover:text-blue-800"
        type="button"
      >
        ← Back to list
      </button>

      <h1 className="text-2xl font-bold mb-4">{service.name}</h1>

      <div className="mb-2">
        <strong>Delivery Time:</strong> {service.deliveryTime}
      </div>

      <div className="mb-4">
        <strong>Price:</strong> ${service.price.toFixed(2)}
      </div>

      <div className="prose whitespace-pre-wrap bg-gray-100 p-4 rounded mb-6">
        {service.description}
      </div>

      <a
        href={`/services/${serviceId}/order`}
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Submit IMEI/SN
      </a>
    </div>
  );
}