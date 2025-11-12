// components/AssistantPartsCarousel.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type Part = {
  title: string;
  partPrice?: number | null;
  labor?: number | null;
  total?: number | null;
  type?: string | null;
  eta?: string | null;
  image?: string | null;
  source?: string | null;
};

export default function AssistantPartsCarousel({
  parts,
  onSelect,
}: {
  parts: Part[];
  onSelect: (p: Part) => void;
}) {
  if (!parts?.length) {
    return (
      <div className="rounded-xl border p-4 text-sm text-muted-foreground">
        No options found. Try refining the model or query.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
        {parts.map((p, i) => (
          <article
            key={`${p.title}-${i}`}
            className="snap-center min-w-[280px] bg-white border rounded-xl shadow-sm p-3"
          >
            <div className="h-32 w-full grid place-items-center bg-gray-100 rounded overflow-hidden relative">
              {p.image ? (
                <Image src={p.image} alt={p.title} fill className="object-contain" />
              ) : (
                <div className="text-xs text-muted-foreground">No image</div>
              )}
            </div>
            <div className="mt-2 font-semibold text-sm line-clamp-2">{p.title}</div>
            <div className="text-xs text-muted-foreground mb-1">
              {(p.eta || "About 2 hours")} • {(p.type || "Premium")}
            </div>
            <div className="text-sm">
              ${((p.total ?? ((p.partPrice ?? 0) + (p.labor ?? 100))) as number).toFixed(2)}{" "}
              <span className="text-xs text-muted-foreground">(Part + Labor)</span>
            </div>
            <Button className="mt-2 w-full" size="sm" onClick={() => onSelect(p)}>
              Select
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
