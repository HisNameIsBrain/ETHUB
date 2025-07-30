'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel'; // ✅ make sure this is imported

type ServiceDetailPageProps = {
  params: {
    serviceId: Id < 'service' > ;
  };
};

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { serviceId } = params;
  
  const service = useQuery(api.services.getServiceById, { id: serviceId });
  
  if (!service) {
    return <div className="p-6">Loading service details...</div>;
  }
  
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{service.name}</h1>
      <p className="mb-2">Price: ${service.price.toFixed(2)}</p>
      <p className="mb-2">Delivery Time: {service.deliveryTime}</p>
      {service.description && <p className="mb-2">{service.description}</p>}
    </div>
  );
}