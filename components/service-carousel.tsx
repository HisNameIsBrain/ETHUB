"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export type ServiceClient = {
  _id: string;
  name: string;
  description?: string;
  price?: number;
};

export function ServiceCarousel ({
  services,
  intervalMs = 4500,
}: {
  services: ServiceClient[];
  intervalMs?: number;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  const rows = useMemo(
    () => (Array.isArray(services) ? services : []),
    [services]
  );

  // auto-advance
  useEffect(() => {
    if (rows.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % rows.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [rows.length, intervalMs]);

  // scroll to selected slide
  useEffect(() => {
    const el = listRef.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [index]);

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* top bar like the black UI */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="text-lg font-medium">Services</div>
          <div className="text-sm text-white/60">Total: {rows.length}</div>
        </div>

        {/* table header */}
        <div className="mx-auto max-w-6xl px-4 pb-2">
          <div className="grid grid-cols-12 text-xs uppercase tracking-wider text-white/60">
            <div className="col-span-4">Title</div>
            <div className="col-span-5">Description</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>
        </div>
      </div>

      {/* slides container */}
      <div
        ref={listRef}
        className="h-[calc(100vh-82px)] overflow-y-auto snap-y snap-mandatory"
      >
        {rows.map((s) => (
          <section
            key={s._id}
            className="snap-start min-h-[calc(100vh-82px)] flex items-center"
          >
            <div className="mx-auto max-w-6xl w-full px-4 py-12">
              {/* Apple-like hero heading + subheading */}
              <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-6xl font-semibold">{s.name}</h1>
                <p className="text-white/70 text-lg md:text-xl">
                  {s.description || "Pro repair & unlock service."}
                </p>
                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    aria-label="More info"
                    className="h-10 px-4 rounded-full border border-white/30 hover:border-white transition"
                    onClick={() => alert(`Info about: ${s.name}`)}
                  >
                    ?
                  </button>
                  <Link
                    href={`/main/services/${s._id}`}
                    className="h-10 px-5 rounded-full bg-white text-black font-medium hover:opacity-90 transition"
                    prefetch
                  >
                    Buy
                  </Link>
                </div>
              </div>

              {/* black table row styled like your screenshot */}
              <div className="mt-10 rounded-xl border border-white/12 overflow-hidden">
                <div className="grid grid-cols-12">
                  <div className="col-span-4 border-r border-white/10 p-4">
                    <div className="text-sm text-white/60 uppercase">
                      serviceId
                    </div>
                    <div className="mt-1 font-mono text-sm break-all">
                      {s._id}
                    </div>
                  </div>
                  <div className="col-span-5 border-r border-white/10 p-4">
                    <div className="text-sm text-white/60 uppercase">
                      name
                    </div>
                    <div className="mt-1">{s.name}</div>
                  </div>
                  <div className="col-span-3 p-4 flex items-center justify-end gap-2">
                    <Link
                      href={`/main/services/${s._id}`}
                      className="px-3 py-2 rounded-md bg-white text-black text-sm"
                    >
                      Buy
                    </Link>
                    <button
                      className="px-3 py-2 rounded-md border border-white/20 text-sm"
                      onClick={() => alert(`Info about: ${s.name}`)}
                    >
                      ?
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-24" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}