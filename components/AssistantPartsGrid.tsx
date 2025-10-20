// components/AssistantPartsGrid.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AssistantPartsGrid() {
  const router = useRouter();
  const [parts, setParts] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchParts() {
      try {
        const res = await fetch("/api/portal/prices");
        if (res.ok) {
          const data = await res.json();
          setParts(data);
        }
      } catch (error) {
        console.error("Failed to fetch parts:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchParts();
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground">Loading parts…</div>;
  if (!parts || parts.length === 0) return <div className="text-sm text-muted-foreground">No parts found.</div>;

  return (
    <div className="grid gap-4">
      {parts.map((part, idx) => (
        <div key={idx} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{part.title}</h3>
          <p className="text-sm text-muted-foreground">${part.price}</p>
        </div>
      ))}
    </div>
  );
}
