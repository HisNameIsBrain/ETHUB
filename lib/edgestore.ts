"use client";

import { createEdgeStoreProvider } from "@edgestore/react";

/**
 * This file MUST be a Client Component because it creates a React Context.
 * Import EdgeStoreProvider in Server Components (like app/layout.tsx) is OK,
 * because the provider itself is a client component boundary.
 */
export const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider();
