// app/(main)/(routes)/services/[serviceId]/page.tsx
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export const dynamic = "force-dynamic";

/* -------------------- helpers -------------------- */

function formatCurrencyFromCents(priceCents?: number | null, currency?: string | null) {
  if (typeof priceCents !== "number") return null;
  try {
    const amount = priceCents / 100;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency ?? "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${(priceCents / 100).toFixed(2)}`;
  }
}

/* ----------------- Metadata (server) ----------------- */

export async function generateMetadata({
  params,
}: {
  params: { serviceId: string };
}) {
  const { serviceId } = params;
  const id = serviceId as Id<"services">;

  const service = await fetchQuery(api.services.getById, { id }).catch(() => null);

  if (!service) {
    return { title: "Service not found - ETECHHUB" };
  }

  return {
    title: `${service.title ?? service.name ?? "Untitled Service"} - ETECHHUB`,
    description: (service as any).notes ?? (service as any).description ?? "View details about this service.",
  };
}

/* -------------------- Page (server) -------------------- */

export default async function ServiceDetail({
  params,
}: {
  params: { serviceId: string };
}) {
  const { serviceId } = params;
  const id = serviceId as Id<"services">;

  const service = await fetchQuery(api.services.getById, { id }).catch(() => null);
  if (!service) return notFound();

  // Support both priceCents (preferred) and legacy price
  const price =
    "priceCents" in service
      ? formatCurrencyFromCents((service as any).priceCents, (service as any).currency)
      : "price" in service && typeof (service as any).price === "number"
      ? new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format((service as any).price)
      : null;

  const title = (service as any).title ?? (service as any).name ?? "Untitled";
  const description = (service as any).notes ?? (service as any).description ?? null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-16 space-y-6">
        <h1 className="text-4xl md:text-5xl font-semibold">{title}</h1>

        {description && <p className="text-white/70">{description}</p>}

        <div className="rounded-xl border border-white/12 overflow-hidden">
          <div className="grid grid-cols-12">
            <div className="col-span-4 border-r border-white/10 p-4">
              <div className="text-sm text-white/60 uppercase">serviceId</div>
              <div className="mt-1 font-mono text-sm break-all">{(service as any)._id}</div>
            </div>

            <div className="col-span-8 p-4 space-y-4">
              <div>
                <div className="text-sm text-white/60 uppercase">name</div>
                <div className="mt-1">{title}</div>
              </div>

              {price && (
                <div>
                  <div className="text-sm text-white/60 uppercase">price</div>
                  <div className="mt-1">{price}</div>
                </div>
              )}

              {"deliveryTime" in service && (service as any).deliveryTime && (
                <div>
                  <div className="text-sm text-white/60 uppercase">delivery</div>
                  <div className="mt-1">{(service as any).deliveryTime}</div>
                </div>
              )}

              {Array.isArray((service as any).tags) && (service as any).tags.length > 0 && (
                <div>
                  <div className="text-sm text-white/60 uppercase">tags</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(service as any).tags.map((t: string) => (
                      <span key={t} className="rounded px-2 py-1 bg-white/6 text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {"sourceUrl" in service && (service as any).sourceUrl && (
                <div>
                  <div className="text-sm text-white/60 uppercase">source</div>
                  <div className="mt-1">
                    <a href={(service as any).sourceUrl} className="text-sm text-white/80 underline" target="_blank" rel="noreferrer">
                      {(service as any).sourceUrl}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* raw JSON for debugging (optional) */}
        <details className="rounded border border-white/6 p-3 text-xs bg-white/2">
          <summary className="cursor-pointer">Raw data</summary>
          <pre className="mt-2 text-xs whitespace-pre-wrap break-words">{JSON.stringify(service, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}
