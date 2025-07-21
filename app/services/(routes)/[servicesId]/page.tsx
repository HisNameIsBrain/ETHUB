'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/spinner';
import { ServicesNavbar } from '@/components/services-navbar';
import { SiriGlow } from '@/components/siri-glow'; // adjust path if needed

export default function ServiceDetailPage() {
  const { serviceId } = useParams() as { serviceId: string };
  const router = useRouter();

  const service = useQuery(api.services.getServiceById, { id: serviceId });
  const user = useQuery(api.users.getCurrentUser); // assumes you have this

  const isAdmin = user?.role === 'admin';

  if (service === undefined || user === undefined) {
    return (
      <div className="p-6">
        <Spinner size="lg" />
      </div>
    );
  }

  if (service === null) {
    return <div className="p-6 text-red-600">Service not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiriGlow />
      <ServicesNavbar />
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-4">{service.name}</h1>
        <div className="space-y-3 text-lg">
          <p><strong>Delivery Time:</strong> {service.deliveryTime}</p>
          <p><strong>Price:</strong> ${service.price?.toFixed(2) ?? 'N/A'}</p>
          {service.description && (
            <p><strong>Description:</strong> {service.description}</p>
          )}
        </div>

        {isAdmin && (
          <div className="mt-6">
            <Button onClick={() => router.push(`/services/edit/${service._id}`)}>
              Edit Service
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}