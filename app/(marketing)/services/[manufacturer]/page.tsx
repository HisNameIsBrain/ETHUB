// 4) app/(app)/services/[manufacturer]/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function fromSlug(slug: string) {
  // If you want perfect reversibility, store manufacturerSlug in DB.
  // For now, best-effort title case.
  return slug
    .split("-")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

function money(cents?: number, currency = "USD") {
  if (cents == null) return null;
  const v = (cents / 100).toFixed(2);
  return `${currency} ${v}`;
}

export default function ManufacturerServicesPage() {
  const params = useParams<{ manufacturer: string }>();
  const manufacturerSlug = params.manufacturer;

  const manufacturerName = useMemo(() => fromSlug(manufacturerSlug), [manufacturerSlug]);

  const serviceGroups = useQuery(api.phoneServices.listServiceGroupsByManufacturer, {
    manufacturer: manufacturerName,
    deviceType: "phone",
    onlyPublic: true,
  });

  const [open, setOpen] = useState<string | undefined>(undefined);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{manufacturerName} Repairs</h1>
        <p className="text-sm text-muted-foreground">
          Tap a service to view catalog entries (serviceId → catalog).
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        value={open}
        onValueChange={(val) => setOpen(val as string | undefined)}
        className="space-y-3"
      >
        {(serviceGroups ?? []).map((svc) => (
          <AccordionItem key={svc.id} value={svc.id} className="border rounded-xl px-4">
            <AccordionTrigger className="py-4">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="text-left">
                  <div className="font-medium">{svc.title}</div>
                  {svc.description ? (
                    <div className="text-sm text-muted-foreground">{svc.description}</div>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {svc.category ? <Badge variant="secondary">{svc.category}</Badge> : null}
                    {svc.deliveryTime ? <Badge variant="outline">{svc.deliveryTime}</Badge> : null}
                  </div>
                </div>

                {svc.priceCents != null ? (
                  <div className="text-right font-semibold">
                    {money(svc.priceCents, svc.currency)}
                  </div>
                ) : null}
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4">
              <ServiceCatalog serviceId={svc.id} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function ServiceCatalog({ serviceId }: { serviceId: any }) {
  const catalog = useQuery(api.phoneServices.listCatalogForService, {
    serviceId,
    activeOnly: true,
  });

  if (!catalog) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  if (catalog.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No catalog entries linked to this service yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {catalog.map((c) => (
        <Card key={c.id} className="p-4 space-y-2">
          <div className="font-medium">{c.deviceModel ? `${c.deviceModel}` : c.title}</div>
          {c.deviceModel ? <div className="text-sm text-muted-foreground">{c.title}</div> : null}
          {c.description ? <div className="text-sm text-muted-foreground">{c.description}</div> : null}
          {c.priceCents != null ? (
            <div className="font-semibold">{money(c.priceCents, c.currency)}</div>
          ) : (
            <div className="text-sm text-muted-foreground">Price not set</div>
          )}
        </Card>
      ))}
    </div>
  );
}
