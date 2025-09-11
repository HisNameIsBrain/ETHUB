"use client";

import { useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ServicesCarousel() {
  const services = useQuery(api.services.getAll) ?? [];

  const sorted = useMemo(
    () => [...services].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [services]
  );

  const { scrollYProgress } = useScroll();
  const shift = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="relative mx-auto max-w-6xl py-10">
      <div className="relative h-[90vh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <ul className="relative flex h-full flex-col items-center justify-center gap-6">
          {sorted.map((s, i) => (
            <ServiceCard key={s._id} index={i} shift={shift} s={s} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function ServiceCard({
  s,
  index,
  shift,
}: {
  s: any;
  index: number;
  shift: any;
}) {
  const base = index * 0.06;
  const y = useTransform(shift, [0, 1], [(-index * 60), (index * 60)]);
  const scale = useTransform(shift, [0, 1], [1 - base, 1 - Math.abs(0.1 - base)]);
  const opacity = useTransform(shift, [0, 1], [1, 0.9]);

  return (
    <motion.li
      style={{ y, scale, opacity }}
      className={cn(
        "w-full max-w-3xl rounded-2xl border bg-card p-5 shadow-sm backdrop-blur",
        "grid grid-cols-[96px_1fr_auto] gap-4 items-center"
      )}
    >
      <div className="relative h-24 w-24 overflow-hidden rounded-xl">
        {s.imageUrl ? (
          <Image src={s.imageUrl} alt={s.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-lg font-semibold">{s.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
        <p className="mt-1 text-sm font-medium">${(s.priceCents / 100).toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {s.button ? (
          <Button asChild variant={s.button.variant ?? "default"} size="sm">
            <Link href={s.button.href as Route}>{s.button.label}</Link>
          </Button>
        ) : (
          <Button disabled size="sm">Unavailable</Button>
        )}
        <div className="text-xs text-muted-foreground">#{String(index + 1).padStart(2, "0")}</div>
      </div>
    </motion.li>
  );
}
