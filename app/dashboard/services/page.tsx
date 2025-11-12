// app/dashboard/services/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
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
const ITEMS_PER_PAGE = 8;

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

type CartState = Record<string, number>;

function computeTotalForPart(part: Part, qty: number) {
  const totalPerUnit = part.partPrice + part.labor;
  return totalPerUnit * qty;
}

type PartCardProps = {
  part: Part;
  quantity: number;
  onQuantityChange: (qty: number) => void;
};

function PartCard({ part, quantity, onQuantityChange }: PartCardProps) {
  const totalPerUnit = part.partPrice + part.labor;
  const totalLine = totalPerUnit * quantity;

  const handleChange = (value: string) => {
    const parsed = Number(value.replace(/[^\d]/g, ""));
    const next = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    onQuantityChange(next);
  };

  return (
    <Card className="flex flex-col overflow-hidden border border-emerald-700/40 bg-slate-950/70 text-slate-50 shadow-lg shadow-emerald-900/40">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/services/${part.id}`}
            className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-emerald-500/60 bg-slate-900/80"
          >
            <img
              src={part.manufacturerLogoUrl}
              alt={part.manufacturer}
              className="h-full w-full object-contain"
            />
          </Link>
          <div className="flex flex-col">
            <CardTitle className="text-sm font-semibold leading-tight">
              {part.deviceModel}
            </CardTitle>
            <span className="text-xs text-emerald-300/80">
              {part.partName}
            </span>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            part.quality === "premium"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/60"
              : "bg-amber-500/15 text-amber-200 border border-amber-400/60"
          )}
        >
          {part.quality === "premium" ? "Premium" : "Aftermarket"}
        </span>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-center rounded-xl border border-slate-700/70 bg-slate-900/80 p-3">
          <img
            src={part.imageUrl}
            alt={part.partName}
            className="max-h-40 w-auto object-contain"
          />
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Part</span>
            <span className="font-semibold">
              ${part.partPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Labor</span>
            <span className="font-semibold">
              ${part.labor.toFixed(2)}
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

        <div className="mt-1 text-[11px] text-slate-400">
          Warranty: <span className="text-slate-200">{part.warranty}</span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full border border-slate-600/70 text-slate-100"
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
            >
              -
            </Button>
            <input
              inputMode="numeric"
              className="h-7 w-12 bg-transparent text-center text-xs text-slate-100 outline-none"
              value={quantity || ""}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="0"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full border border-slate-600/70 text-slate-100"
              onClick={() => onQuantityChange(quantity + 1)}
            >
              +
            </Button>
          </div>

          <div className="text-right text-[11px]">
            <div className="text-slate-400">Line total</div>
            <div className="font-semibold text-emerald-300">
              ${totalLine.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-slate-700/80 pt-2">
          <Button
            asChild
            size="sm"
            className="h-8 rounded-full bg-emerald-500 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          >
            <Link href={`/dashboard/services/${part.id}`}>
              View service details
            </Link>
          </Button>
          <span className="text-[11px] text-slate-400">
            Manufacturer:{" "}
            <span className="text-slate-200">{part.manufacturer}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServicesDashboardPage() {
  const [qualityPref, setQualityPref] = useState<Quality>("premium");
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<CartState>({});

  const filteredParts = useMemo(() => {
    const primaryFirst = [...mockParts].sort((a, b) => {
      if (a.quality === b.quality) return 0;
      if (a.quality === qualityPref && b.quality !== qualityPref) return -1;
      if (b.quality === qualityPref && a.quality !== qualityPref) return 1;
      return a.quality === "premium" ? -1 : 1;
    });
    return primaryFirst;
  }, [qualityPref]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredParts.length / ITEMS_PER_PAGE)
  );

  const currentPageParts = filteredParts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleQuantityChange = (partId: string, qty: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[partId];
      } else {
        next[partId] = qty;
      }
      return next;
    });
  };

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const part = mockParts.find((p) => p.id === id);
        if (!part || qty <= 0) return null;
        const lineTotal = computeTotalForPart(part, qty);
        return { part, qty, lineTotal };
      })
      .filter(Boolean) as { part: Part; qty: number; lineTotal: number }[];
  }, [cart]);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  );

  return (
    <div className="flex h-full flex-col gap-4 bg-slate-950/90 p-4 text-slate-50">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Device Services & Parts
          </h1>
          <p className="text-xs text-slate-400">
            Prioritizing premium assemblies, with aftermarket as secondary
            options.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/70 bg-slate-900/80 p-1">
          <button
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition",
              qualityPref === "premium"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-300"
            )}
            onClick={() => setQualityPref("premium")}
          >
            Premium first
          </button>
          <button
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition",
              qualityPref === "aftermarket"
                ? "bg-amber-400 text-slate-950 shadow"
                : "text-slate-300"
            )}
            onClick={() => setQualityPref("aftermarket")}
          >
            Aftermarket focus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2.5fr)_minmax(260px,1fr)]">
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {currentPageParts.map((part) => (
              <PartCard
                key={part.id}
                part={part}
                quantity={cart[part.id] ?? 0}
                onQuantityChange={(qty) => handleQuantityChange(part.id, qty)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs text-slate-400">
            <div>
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full border-slate-700 bg-slate-900 text-xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ← Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full border-slate-700 bg-slate-900 text-xs"
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page >= totalPages}
              >
                Next →
              </Button>
            </div>
          </div>
        </div>

        <aside className="flex h-full flex-col rounded-2xl border border-emerald-700/60 bg-slate-950/95 p-3 shadow-lg shadow-emerald-900/40">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Cart</h2>
            <span className="text-[11px] text-slate-400">
              {cartItems.length} line item
              {cartItems.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-xs">
            {cartItems.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-700/80 bg-slate-900/80 p-3 text-[11px] text-slate-500">
                Set quantities on parts to start a new sale.
              </div>
            )}

            {cartItems.map(({ part, qty, lineTotal }) => (
              <div
                key={part.id}
                className="rounded-lg border border-slate-800 bg-slate-900/80 p-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold">
                      {part.deviceModel}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {part.partName}
                    </span>
                  </div>
                  <div className="text-right text-[10px] text-slate-400">
                    <div>Qty: {qty}</div>
                    <div>${lineTotal.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Order total</span>
              <span className="text-base font-semibold text-emerald-300">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <Button
              className="mt-2 h-9 w-full rounded-full bg-emerald-500 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
              disabled={cartItems.length === 0}
            >
              Proceed to checkout (ETHUB)
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
