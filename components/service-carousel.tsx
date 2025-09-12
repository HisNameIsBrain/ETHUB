"use client";

import * as React from "react";

type Service = {
  _id: string;
  name?: string;
  description?: string;
  imageUrl?: string;
};

export function ServiceCarousel({ raw }: { raw: Service[] | undefined }) {
  const services = React.useMemo(() => {
    const list = Array.isArray(raw) ? raw : [];
    return list.map((s) => ({
      id: s._id,
      name: s.name ?? "Untitled",
      description: s.description ?? "",
      imageUrl: s.imageUrl ?? "",
    }));
  }, [raw]);

  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (services.length === 0) return;
    if (index >= services.length) setIndex(0);
  }, [services, index]);

  if (!services.length) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex transition-transform" style={{ transform: `translateX(-${index * 100}%)` }}>
        {services.map((s) => (
          <div key={s.id} className="min-w-full p-4">
            <div className="rounded-2xl border p-6">
              <div className="text-lg font-semibold">{s.name}</div>
              <div className="text-sm text-muted-foreground">{s.description}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        {services.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 w-2 rounded-full ${i === index ? "bg-foreground" : "bg-muted"}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
