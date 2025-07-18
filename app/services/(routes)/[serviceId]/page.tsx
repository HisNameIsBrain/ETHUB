// app/services/[serviceId]/page.tsx
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function ServiceDetail({ params }: { params: { serviceId: string } }) {
  const service = useQuery(api.services.getServiceById, { id: params.serviceId });

  if (!service) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-2">{service.name}</h1>
      <p className="mb-1"><strong>Delivery Time:</strong> {service.deliveryTime}</p>
      <p className="mb-4"><strong>Price:</strong> ${service.price}</p>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: service.description }}
      />
      <a
        href={`/services/${params.serviceId}/order`}
        className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit IMEI/SN
      </a>
    </div>
  );
}