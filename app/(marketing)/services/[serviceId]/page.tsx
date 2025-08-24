import { notFound } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function generateMetadata({ params }: { params: { serviceId: string } }) {
  const id = params.serviceId as Id<"services">;
  const service = await fetchQuery(api.services.getById, { id }).catch(() => null);
  return {
    title: service?.name ? `${service.name} - ETECHHUB` : "Service - ETECHHUB",
    description: service?.description ?? "Service details",
  };
}

export default async function ServiceDetail({ params }: { params: { serviceId: string } }) {
  const id = params.serviceId as Id<"services">;
  const service = await fetchQuery(api.services.getById, { id }).catch(() => null);
  if (!service) return notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">{service.name}</h1>
      {service.description ? <p className="text-muted-foreground">{service.description}</p> : null}
      {typeof service.price === "number" ? (
        <p className="mt-4 font-medium">${service.price.toFixed(2)}</p>
      ) : null}
    </div>
  );
}
