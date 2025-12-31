// 3) app/(app)/services/page.tsx
"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smartphone, Apple, BadgeCheck, Zap, Cpu, Shield } from "lucide-react";

function iconForManufacturer(m: string) {
  const k = m.toLowerCase();
  if (k.includes("apple")) return Apple;
  if (k.includes("samsung")) return Smartphone;
  if (k.includes("google")) return Cpu;
  if (k.includes("motorola")) return Zap;
  if (k.includes("oneplus")) return BadgeCheck;
  return Shield;
}

function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ServicesPage() {
  const manufacturers = useQuery(api.phoneServices.listManufacturers, {
    deviceType: "phone",
    onlyPublic: true,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Phone Repair Services</h1>
        <p className="text-sm text-muted-foreground">
          Select a manufacturer to view quick repair services.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(manufacturers ?? []).map(({ manufacturer }) => {
          const Icon = iconForManufacturer(manufacturer);
          return (
            <Link
              key={manufacturer}
              href={`/services/${toSlug(manufacturer)}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{manufacturer}</CardTitle>
                  </div>
                  <CardDescription>
                    View available repairs and pricing by service type.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
