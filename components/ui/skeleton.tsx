"use client";

import * as React from "react";

// If you don't have cn in "@/lib/utils", this will still work without it.
// Comment back in the cn version if you prefer.
type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className = "", ...props }: DivProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      {...props}
    />
  );
}
