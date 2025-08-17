"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export function Cover({ url }: { url?: string }) {
  if (!url) {
    return <Skeleton className="w-full h-[12vh]" />;
  }

  return (
    <div className="relative w-full h-[12vh]">
      <Image
        src={url}
        alt="Cover"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
    </div>
  );
}
