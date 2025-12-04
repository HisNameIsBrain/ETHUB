"use client";

import * as React from "react";

/**
 * Minimal no-op EdgeStoreProvider.
 * Replace with your actual provider when ready.
 *
 * Example real usage (later):
 * import { EdgeStoreProvider as RealEdgeStoreProvider } from "@edgestore/react";
 * export function EdgeStoreProvider({ children }: { children: React.ReactNode }) {
 *   return <RealEdgeStoreProvider>{children}</RealEdgeStoreProvider>;
 * }
 */
export function EdgeStoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
