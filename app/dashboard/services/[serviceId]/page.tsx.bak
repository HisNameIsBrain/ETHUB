// app/(main)/(routes)/services/[serviceId]/page.tsx
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export const dynamic = "force-dynamic"; // optional; ensures fresh data on each request

// Generate metadata dynamically for SEO and link previews
export async function generateMetadata({
  params,
}: {
  params: { serviceId: string };
}) {
  const id = params.serviceId as Id < "services" > ;
  const service = await fetchQuery(api.services.getById, { id }).catch(() => null);
  
  if (!service) {
    return { title: "Service not found - ETECHHUB" };
  }
  
  return {
    title: `${service.name ?? "Untitled Service"} - ETECHHUB`,
    description: service.description ?? "View details about this service.",
  };
}

export default async function ServiceDetail({
  params,
}: { params: { serviceId: string } }) {
  const id = params.serviceId as Id < "services" > ;
  const service = await fetchQuery(api.services.getById, { id }).catch(() => null);
  
  if (!service) return notFound();
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-16 space-y-6">
        <h1 className="text-4xl md:text-5xl font-semibold">
          {service.name ?? "Untitled"}
        </h1>
        {service.description && (
          <p className="text-white/70">{service.description}</p>
        )}

        <div className="rounded-xl border border-white/12 overflow-hidden">
          <div className="grid grid-cols-12">
            <div className="col-span-4 border-r border-white/10 p-4">
              <div className="text-sm text-white/60 uppercase">serviceId</div>
              <div className="mt-1 font-mono text-sm break-all">
                {(service as any)._id}
              </div>
            </div>
            <div className="col-span-8 p-4 space-y-4">
              <div>
                <div className="text-sm text-white/60 uppercase">name</div>
                <div className="mt-1">{service.name ?? "Untitled"}</div>
              </div>
              {"price" in service && typeof service.price === "number" && (
                <div>
                  <div className="text-sm text-white/60 uppercase">price</div>
                  <div className="mt-1">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 2,
                    }).format(service.price)}
                  </div>
                </div>
              )}
              {(service as any).deliveryTime && (
                <div>
                  <div className="text-sm text-white/60 uppercase">delivery</div>
                  <div className="mt-1">{(service as any).deliveryTime}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}