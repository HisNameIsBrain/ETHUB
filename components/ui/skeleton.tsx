import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes < HTMLDivElement > ) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        // If you don't use shadcn theme tokens, swap to:
        // "animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800",
        className
      )}
      {...props}
    />
  );
}