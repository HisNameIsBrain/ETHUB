"use client";
import React from "react";
import { Button } from "@/components/ui/button";

type Part = {
  _id?: string;
  title: string;
  device: string;
  category: string;
  partPrice: number;
  labor: number;
  total: number;
  image?: string;
  source?: string;
};

export default function AssistantPartsGrid({
  query,
  onApprove,
}: {
  query: string;
  onApprove: (p: Part) => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [parts, setParts] = React.useState<Part[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function run() {
      if (!query) { setParts([]); return; }
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/parts?query=${encodeURIComponent(query)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!mounted) return;
        setParts(data.results ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Failed to fetch parts");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [query]);

  if (!query) return <div className="text-sm text-muted-foreground">Provide a device & service above to fetch parts.</div>;
  if (loading) return <div className="text-sm">Fetching parts & live pricing…</div>;
  if (error) return <div className="text-sm text-red-600">Error: {error}</div>;
  if (parts.length === 0) return <div className="text-sm text-muted-foreground">No parts found for “{query}”.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {parts.map((p, i) => (
        <div key={(p as any)._id ?? `${p.title}-${i}`} className="border rounded-lg p-3">
          {p.image ? (
            <img src={p.image} alt={p.title} className="h-24 w-full object-cover rounded" />
          ) : (
            <div className="h-24 w-full bg-gray-100 rounded" />
          )}
          <div className="mt-2 text-sm font-medium">{p.title}</div>
          <div className="text-xs text-muted-foreground">{p.device} • {p.category}</div>
          <div className="mt-2 text-sm">
            Part: ${p.partPrice.toFixed(2)} • Labor: ${p.labor.toFixed(2)}
          </div>
          <div className="font-semibold">${p.total.toFixed(2)}</div>
          <div className="mt-2">
            <Button size="sm" onClick={() => onApprove(p)}>Approve</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
