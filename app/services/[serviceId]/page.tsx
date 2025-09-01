// app/(main)/(routes)/services/[serviceId]/page.tsx
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export const dynamic = "force-dynamic";

// ---- Metadata ----
export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const id = serviceId as Id<"services">;

  const service = await fetchQuery(api.services.getById, { id }).catch(() => null);

  if (!service) {
    return { title: &quot;Service not found - ETECHHUB&quot; };
  }

  return {
    title: `${service.name ?? &quot;Untitled Service&quot;} - ETECHHUB`,
    description: service.description ?? &quot;View details about this service.&quot;,
  };
}

// ---- Page ----
export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const id = serviceId as Id<"services">;

  const service = await fetchQuery(api.services.getById, { id }).catch(() => null);
  if (!service) return notFound();

  const price =
    &quot;price&quot; in service && typeof service.price === &quot;number&quot;
      ? new Intl.NumberFormat(undefined, {
          style: &quot;currency&quot;,
          currency: &quot;USD&quot;,
          maximumFractionDigits: 2,
        }).format(service.price)
      : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-16 space-y-6">
        <h1 className="text-4xl md:text-5xl font-semibold">
          {service.name ?? &quot;Untitled&quot;}
        </h1>

        {service.description && (
          <p className="text-white/70">{service.description}</p>
        )}

        <div className="rounded-xl border border-white/12 overflow-hidden">
          <div className="grid grid-cols-12">
            <div className="col-span-4 border-r border-white/10 p-4">
              <div className="text-sm text-white/60 uppercase">serviceId</div>
              <div className="mt-1 font-mono text-sm break-all">{service._id}</div>
            </div>

            <div className="col-span-8 p-4 space-y-4">
              <div>
                <div className="text-sm text-white/60 uppercase">name</div>
                <div className="mt-1">{service.name ?? &quot;Untitled&quot;}</div>
              </div>

              {price && (
                <div>
                  <div className="text-sm text-white/60 uppercase">price</div>
                  <div className="mt-1">{price}</div>
                </div>
              )}

              {&quot;deliveryTime&quot; in service && (service as any).deliveryTime && (
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
