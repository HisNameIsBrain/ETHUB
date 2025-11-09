"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Part = {
  _id?: string;
  title: string;
  device: string;
  category: string;
  partPrice: number;
  labor: number;
  total?: number;
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
      if (!query) {
        setParts([]);
        return;
      }
      setLoading(true);
      setError(null);
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
    return () => {
      mounted = false;
    };
  }, [query]);

  if (!query) return <div className="text-sm text-muted-foreground">Provide a device & service above to fetch parts.</div>;
  if (loading) return <div className="text-sm">Fetching parts & live pricing…</div>;
  if (error) return <div className="text-sm text-red-600">Error: {error}</div>;
  if (parts.length === 0) return <div className="text-sm text-muted-foreground">No parts found for “{query}”.</div>;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {parts.map((p, i) => {
        const key = p._id ?? `${p.title}-${i}`;
        const total = typeof p.total === "number" ? p.total : (Number(p.partPrice || 0) + Number(p.labor || 0));
        const schemaHref = p._id
          ? `/schema/parts/${encodeURIComponent(p._id)}`
          : `/schema/parts/new?title=${encodeURIComponent(p.title)}&device=${encodeURIComponent(
              p.device
            )}&category=${encodeURIComponent(p.category)}`;

        return (
          <div key={key} className="rounded-lg border p-3">
            {p.image ? (
              <img src={p.image} alt={p.title} className="h-24 w-full rounded object-cover" />
            ) : (
              <div className="h-24 w-full rounded bg-muted" />
            )}

            <div className="mt-2 text-sm font-medium">{p.title}</div>
            <div className="text-xs text-muted-foreground">
              {p.device} • {p.category}
            </div>

            <div className="mt-2 text-sm">
              Part: ${Number(p.partPrice || 0).toFixed(2)} • Labor: ${Number(p.labor || 0).toFixed(2)}
            </div>
            <div className="font-semibold">${total.toFixed(2)}</div>

            <div className="mt-2 flex items-center gap-2">
              <Button size="sm" onClick={() => onApprove({ ...p, total })}>
                Approve
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={schemaHref}>Edit schema</Link>
              </Button>
              {p.source ? (
                <Button size="sm" variant="ghost" asChild>
                  <a href={p.source} target="_blank" rel="noreferrer">
                    Source
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
