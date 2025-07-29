'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import '@/components/card'; // Assuming you move the styles into this CSS file

export default function AdminServicesPage() {
  const router = useRouter();
  const services = useQuery(api.services.getAll);
  
  if (services === undefined) {
    return <div className="p-6">Loading services...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-wrap justify-center items-center bg-gradient-to-b from-white to-gray-100 p-6">
      {services.map((service) => (
        <div
          key={service._id}
          className="card m-4 cursor-pointer relative"
          onClick={() => router.push(`/services/${service._id}`)}
        >
          <div className="sun" />
          <div className="hint">
            <div className="icon-info" />
            <div className="pulse anima" />
          </div>
          <div id="wrapper" className="show">
            <div id="image" />
            <div className="items" />
            <div className="items" />
            <div className="items" />
            <div className="items" />
            <div className="items" />
            <div className="items" />
          </div>
          <div className="horizon" />
        </div>
      ))}
    </div>
  );
}