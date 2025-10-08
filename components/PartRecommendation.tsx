"use client";

import React, { useEffect, useState } from "react";

type Item = {
  title?: string | null;
  image?: string | null;
  sourceUrl?: string | null;
  partPrice?: number | null;
  labor?: number;
  total?: number | null;
  priceText?: string | null;
};

export default function PartRecommendation({ query = "iphone 15 pro max" }: { query?: string }) {
  const [loading, setLoading] = useState(false);
  const [recommended, setRecommended] = useState<Item | null>(null);
  const [alternative, setAlternative] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/mobilesentrix/prices?query=${encodeURIComponent(query)}`);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || res.statusText);
        }
        const json = await res.json();
        if (!mounted) return;
        setRecommended(json.recommended ?? null);
        setAlternative(json.alternative ?? null);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [query]);

  function Tile({ item, label }: { item: Item | null; label: string }) {
    if (!item) return null;
    const price = item.total ?? null;
    return (
      <div className="max-w-xs rounded-lg border p-3 text-center">
        {label && <div className="text-xs text-muted mb-2">{label}</div>}
        {item.image ? (
          <img src={item.image} alt={item.title ?? "part"} className="mx-auto h-40 object-contain" />
        ) : (
          <div className="h-40 bg-gray-100 flex items-center justify-center text-sm">No image</div>
        )}
        <div className="mt-3 text-sm">{item.title}</div>
        <div className="mt-2 text-xl font-semibold">${price !== null ? price.toFixed(2) : "TBA"}</div>
        {item.partPrice !== null && (
          <div className="text-xs text-muted">Part: ${item.partPrice?.toFixed(2)} + Labor: ${item.labor}</div>
        )}
      </div>
    );
  }

  if (loading) return <div>Loading parts…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="mb-2 text-sm">Recommended option (best quality)</div>
      <Tile item={recommended} label="Premium — recommended" />
      <div className="mt-6 mb-2 text-sm">Alternative (economical)</div>
      <Tile item={alternative} label="Aftermarket — economical option" />
      <p className="mt-4 text-xs text-muted">
        Recommendation: we suggest the premium 120Hz OLED first. If you prefer cheaper, choose the aftermarket alternative (also includes $100 labor).
      </p>
    </div>
  );
}
