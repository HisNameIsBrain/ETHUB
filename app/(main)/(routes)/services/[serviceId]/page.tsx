// app/(main)/(routes)/services/[serviceId]/page.tsx
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function ServiceDetail({
  params,
}: { params: { serviceId: string } }) {
  const service = await fetchQuery(api.services.getById, { id: params.serviceId });
  
  if (!service) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center">
        <div className="text-white/70">Service not found.</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-16 space-y-6">
        <h1 className="text-4xl md:text-5xl font-semibold">{service.name}</h1>
        <p className="text-white/70">{service.description}</p>

        <div className="rounded-xl border border-white/12 overflow-hidden">
          <div className="grid grid-cols-12">
            <div className="col-span-4 border-r border-white/10 p-4">
              <div className="text-sm text-white/60 uppercase">serviceId</div>
              <div className="mt-1 font-mono text-sm break-all">
                {(service as any)._id}
              </div>
            </div>
            <div className="col-span-8 p-4">
              <div className="text-sm text-white/60 uppercase">name</div>
              <div className="mt-1">{service.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}