// app/services/[serviceId]/page.tsx

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { notFound } from "next/navigation";

export default async function ServiceDetail({
  params,
}: {
  params: { serviceId: string };
}) {
  try {
    // Cast string to Convex Id
    const service = await fetchQuery(api.services.getServiceById, {
      id: params.serviceId as Id < "services" > ,
    });
    
    // If service not found in DB, return 404
    if (!service) return notFound();
    
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{service.name}</h1>

        <div className="mb-2">
          <strong>Delivery Time:</strong> {service.deliveryTime}
        </div>
        <div className="mb-4">
          <strong>Price:</strong> ${service.price}
        </div>

        <div className="prose whitespace-pre-wrap bg-gray-100 p-4 rounded mb-6">
          {service.description}
        </div>

        <a
          href={`/services/${params.serviceId}/order`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Submit IMEI/SN
        </a>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch service:", error);
    return notFound();
  }
}