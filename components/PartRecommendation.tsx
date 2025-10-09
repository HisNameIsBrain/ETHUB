// components/PartRecommendation.tsx
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

type Item = {
  id?: string | null;
  title?: string;
  image?: string | null;
  partPrice?: number | null;
  labor?: number | null;
  total?: number | null;
  vendor?: string;
};

export default function PartRecommendation({ query }: { query?: string }) {
  const [loading, setLoading] = useState(false);
  const [recommended, setRecommended] = useState<Item | null>(null);
  const [alternative, setAlternative] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!query || !query.trim()) return;
      setLoading(true);
      setError(null);
      try {
        // We call the invoices endpoint with only partQuery to get suggestions (no token required for guest mode)
        // If your API requires Authorization, pass Bearer token.
        const res = await fetch(`/api/portal/invoices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partQuery: query, name: "probe", service: query }),
        });
        const json = await res.json();
        if (!mounted) return;
        if (!res.ok) {
          setError(json?.error ?? "Failed to fetch parts");
          return;
        }
        setRecommended(json.recommended ?? null);
        setAlternative(json.alternative ?? null);
      } catch (err: any) {
        setError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [query]);

  if (loading) return <div>Loading parts…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  function PartTile({ item, label }: { item: Item | null; label: string }) {
    if (!item) return null;
    return (
      <Card className="p-3">
        <div className="text-xs text-muted mb-2">{label}</div>
        <Card className="p-2 bg-white/80">
          <div className="flex gap-3 items-start">
            <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-50">
              {item.image ? (
                // next/image expects allowed domains; if CORS issue, use <img>
                // <Image src={item.image} alt={item.title} width={96} height={96} />
                <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted">No image</div>
              )}
            </div>

            <div className="flex-1">
              <div className="font-medium text-sm">{item.title}</div>
              <div className="text-xs text-muted mt-1">{item.vendor}</div>
              <div className="mt-2">
                <div className="text-sm font-semibold">${item.total?.toFixed(2) ?? "TBA"}</div>
                <div className="text-xs text-muted">Part: ${item.partPrice?.toFixed(2) ?? "TBA"} + Labor: ${item.labor ?? DEFAULT_LABOR}</div>
              </div>
            </div>
          </div>
        </Card>
      </Card>
    );
  }

  // DEFAULT_LABOR used only in display if item.labor missing
  const DEFAULT_LABOR = Number(process.env.NEXT_PUBLIC_LABOR_DEFAULT ?? "100");

  return (
    <div className="space-y-3">
      <PartTile item={recommended} label="Recommended — Premium" />
      <PartTile item={alternative} label="Alternative — Economical" />
    </div>
  );
}
