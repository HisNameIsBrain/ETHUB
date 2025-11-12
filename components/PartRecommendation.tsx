"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Item = {
  id?: string | null;
  title?: string;
  image?: string | null;
  partPrice?: number | null;
  labor?: number | null;
  total?: number | null;
  vendor?: string;
};

const DEFAULT_LABOR = Number(process.env.NEXT_PUBLIC_LABOR_DEFAULT ?? "100");

export default function PartRecommendation({ query }: { query?: string }) {
  const [loading, setLoading] = useState(false);
  const [recommended, setRecommended] = useState<Item | null>(null);
  const [alternative, setAlternative] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mutations to save part metadata and images into Convex
  const savePart = useMutation(api.parts.savePart);
  const saveImages = useMutation(api.partImages.saveImages);

  // Also offer a query to fetch previously cached parts for this query
  const cachedParts = useQuery(api.parts.getPartsByQuery, { query: query ?? "" });

  useEffect(() => {
    let mounted = true;

    async function loadRemote() {
      if (!query || !query.trim()) return;
      setLoading(true);
      setError(null);

      try {
        // Try cached parts first (Convex)
        if (cachedParts && cachedParts.length > 0) {
          // Use the first two cached entries as recommended/alternative
          if (!mounted) return;
          setRecommended(cachedParts[0] ?? null);
          setAlternative(cachedParts[1] ?? null);
          setLoading(false);
          return;
        }

        // Fallback: hit your /api/portal/invoices endpoint (as previously used)
        const res = await fetch(`/api/portal/invoices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partQuery: query, name: "probe", service: query }),
        });

        const json = await res.json();
        if (!mounted) return;

        if (!res.ok) {
          setError(json?.error ?? "Failed to fetch parts");
          setLoading(false);
          return;
        }

        const rec = json.recommended ?? null;
        const alt = json.alternative ?? null;

        // Normalize shape slightly
        const normalize = (p: any): Item | null => {
          if (!p) return null;
          return {
            id: p.id ?? null,
            title: p.title ?? p.name ?? "Part",
            image: p.image ?? p.thumbnail ?? null,
            partPrice: p.partPrice ?? p.price ?? null,
            labor: p.labor ?? p.estimatedLabor ?? DEFAULT_LABOR,
            total: typeof p.total === "number" ? p.total : (p.partPrice ? (p.partPrice + (p.labor ?? DEFAULT_LABOR)) : null),
            vendor: p.vendor ?? p.source ?? null,
          };
        };

        const recItem = normalize(rec);
        const altItem = normalize(alt);

        // Save parts and images to Convex for quicker access next time
        const toSaveParts = [recItem, altItem].filter(Boolean);
        if (toSaveParts.length > 0) {
          try {
            // save part entries
            for (const p of toSaveParts) {
              await savePart({
                title: p!.title ?? "Part",
                image: p!.image ?? null,
                partPrice: p!.partPrice ?? null,
                labor: p!.labor ?? null,
                total: p!.total ?? null,
                vendor: p!.vendor ?? null,
                query,
              });
            }
          } catch (e) {
            console.warn("Failed to save part(s) to Convex:", e);
          }
        }

        // If the endpoint returned image list, save those too via partImages
        if (json.images && Array.isArray(json.images) && json.images.length > 0) {
          try {
            await saveImages({ query, images: json.images });
          } catch (e) {
            console.warn("Failed to save images to Convex:", e);
          }
        }

        setRecommended(recItem);
        setAlternative(altItem);
      } catch (err: any) {
        setError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRemote();

    return () => {
      mounted = false;
    };
    // we intentionally include cachedParts so if convex cache changes we re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, cachedParts]);

  if (loading) return <div>Loading parts…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  function PartTile({ item, label }: { item: Item | null; label: string }) {
    if (!item) return null;
    return (
      <Card className="p-3">
        <div className="text-xs text-muted mb-2">{label}</div>

        <div className="p-2 bg-white/80 rounded">
          <div className="flex gap-3 items-start">
            <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
              {item.image ? (
                // simple <img> to avoid next/image domain issues
                <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
              ) : (
                <div className="text-xs text-muted-foreground">No image</div>
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
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Recommended Parts</h3>
      <PartTile item={recommended} label="Recommended — Premium" />
      <PartTile item={alternative} label="Alternative — Economical" />
    </div>
  );
}
