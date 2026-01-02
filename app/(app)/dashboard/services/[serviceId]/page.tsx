// app/dashboard/services/[serviceId]/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Quality = "premium" | "aftermarket";

type Part = {
  id: string;
  deviceModel: string;
  partName: string;
  manufacturer: string;
  manufacturerLogoUrl: string;
  imageUrl: string;
  quality: Quality;
  partPrice: number;
  labor: number;
  warranty: string;
};

const LABOR_BASE = 65;

const mockParts: Part[] = [
  {
    id: "ip15pm_oled_oem",
    deviceModel: "iPhone 15 Pro Max",
    partName: "OLED Assembly (Genuine OEM)",
    manufacturer: "Apple",
    manufacturerLogoUrl: "/logos/apple-oem.png",
    imageUrl: "/images/parts/iphone-15pm-oled-oem.png",
    quality: "premium",
    partPrice: 379.96,
    labor: LABOR_BASE,
    warranty: "1-year limited warranty",
  },
  {
    id: "ip15pm_lcd_aq7",
    deviceModel: "iPhone 15 Pro Max",
    partName: "LCD Assembly (AQ7 / Incell 120Hz)",
    manufacturer: "AQ7",
    manufacturerLogoUrl: "/logos/aq7.png",
    imageUrl: "/images/parts/iphone-15pm-lcd-aq7.png",
    quality: "aftermarket",
    partPrice: 42.35,
    labor: LABOR_BASE,
    warranty: "90-day parts warranty",
  },
  {
    id: "ip14pm_oled_soft",
    deviceModel: "iPhone 14 Pro Max",
    partName: "OLED Assembly Soft (XO7 120Hz)",
    manufacturer: "XO7",
    manufacturerLogoUrl: "/logos/xo7.png",
    imageUrl: "/images/parts/iphone-14pm-oled-soft.png",
    quality: "premium",
    partPrice: 329.99,
    labor: LABOR_BASE,
    warranty: "1-year limited warranty",
  },
];

function computeTotal(part: Part, qty: number) {
  const totalPerUnit = part.partPrice + part.labor;
  return totalPerUnit * qty;
}

export default function ServiceDetailPage() {
  const params = useParams<{ serviceId: string }>();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  const service = mockParts.find((p) => p.id === params?.serviceId);
  const related = useMemo(() => {
    if (!service) return [];
    return mockParts.filter(
      (p) =>
        p.id !== service.id &&
        (p.deviceModel === service.deviceModel ||
          p.manufacturer === service.manufacturer)
    );
  }, [service]);

  if (!service) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm">Service not found.</p>
        <Button
          className="mt-2 rounded-full bg-emerald-500 text-xs text-slate-950 hover:bg-emerald-400"
          onClick={() => router.push("/dashboard/services")}
        >
          Back to services
        </Button>
      </div>
    );
  }

  const totalPerUnit = service.partPrice + service.labor;
  const lineTotal = computeTotal(service, qty);

  return (
    <div className="flex h-full flex-col gap-4 bg-slate-950/95 p-4 text-slate-50">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            {service.deviceModel} – {service.partName}
          </h1>
          <p className="text-xs text-slate-400">
            Service detail and related repair options from your ETHUB catalog.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-8 rounded-full border-slate-700 bg-slate-900 text-xs text-slate-100"
          onClick={() => router.push("/dashboard/services")}
        >
          Back to services
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)]">
        <Card className="border border-emerald-700/60 bg-slate-950/80">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-emerald-500/70 bg-slate-900/80">
                <img
                  src={service.manufacturerLogoUrl}
                  alt={service.manufacturer}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold leading-tight">
                  {service.deviceModel}
                </CardTitle>
                <span className="text-xs text-emerald-300/90">
                  {service.partName}
                </span>
                <span className="text-[11px] text-slate-400">
                  Manufacturer:{" "}
                  <span className="text-slate-200">
                    {service.manufacturer}
                  </span>
                </span>
              </div>
            </div>

            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                service.quality === "premium"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/60"
                  : "bg-amber-500/15 text-amber-200 border border-amber-400/60"
              )}
            >
              {service.quality === "premium" ? "Premium" : "Aftermarket"}
            </span>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-1 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/80 p-4">
                <img
                  src={service.imageUrl}
                  alt={service.partName}
                  className="max-h-64 w-auto object-contain"
                />
              </div>

              <div className="flex min-w-[220px] flex-col gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Part</span>
                    <span className="font-semibold">
                      ${service.partPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Labor</span>
                    <span className="font-semibold">
                      ${service.labor.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700/80 pt-1">
                    <span className="text-slate-200 text-[11px] font-semibold">
                      Total per unit
                    </span>
                    <span className="text-emerald-300 font-semibold">
                      ${totalPerUnit.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  Warranty:{" "}
                  <span className="text-slate-200">{service.warranty}</span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full border border-slate-600/70 text-slate-100"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                    >
                      -
                    </Button>
                    <input
                      inputMode="numeric"
                      className="h-7 w-12 bg-transparent text-center text-xs text-slate-100 outline-none"
                      value={qty}
                      onChange={(e) => {
                        const parsed = Number(
                          e.target.value.replace(/[^\d]/g, "")
                        );
                        const next = Number.isNaN(parsed)
                          ? 1
                          : Math.max(1, parsed);
                        setQty(next);
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full border border-slate-600/70 text-slate-100"
                      onClick={() => setQty((q) => q + 1)}
                    >
                      +
                    </Button>
                  </div>

                  <div className="text-right text-[11px]">
                    <div className="text-slate-400">Line total</div>
                    <div className="font-semibold text-emerald-300">
                      ${lineTotal.toFixed(2)}
                    </div>
                  </div>
                </div>

                <Button className="mt-2 h-8 rounded-full bg-emerald-500 text-xs font-semibold text-slate-950 hover:bg-emerald-400">
                  Add to ETHUB cart
                </Button>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-xs text-slate-300">
              <p className="mb-1 font-semibold">
                Services available for this device
              </p>
              <p className="text-[11px] text-slate-400">
                This section is where you can surface all services from your
                Convex <code>services</code> schema that match this device
                model and quality profile and let your technicians confirm the
                selected configuration.
              </p>
            </div>
          </CardContent>
        </Card>

        <aside className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-950/95 p-3">
          <h2 className="mb-2 text-sm font-semibold">
            Recommended alternatives
          </h2>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-xs">
            {related.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-700/80 bg-slate-900/80 p-3 text-[11px] text-slate-500">
                No related services found in the mock catalog.
              </div>
            )}
            {related.map((part) => {
              const total = part.partPrice + part.labor;
              return (
                <div
                  key={part.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/80 p-2"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold">
                      {part.partName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {part.deviceModel}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 inline-flex w-fit rounded-full px-2 py-px text-[9px] font-medium",
                        part.quality === "premium"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/60"
                          : "bg-amber-500/15 text-amber-200 border border-amber-400/60"
                      )}
                    >
                      {part.quality === "premium"
                        ? "Premium"
                        : "Aftermarket"}
                    </span>
                  </div>
                  <div className="text-right text-[10px]">
                    <div className="text-slate-400">
                      ${total.toFixed(2)}
                    </div>
                    <Button
                      size="sm"
                      className="mt-1 h-6 rounded-full bg-slate-800 text-[10px] text-slate-100 hover:bg-slate-700"
                      onClick={() =>
                        router.push(`/dashboard/services/${part.id}`)
                      }
                    >
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
