// app/dashboard/_components/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// Narrow helper to cast string → Convex Id<"services"> without changing call sites.
const asServiceId = (id: string) => id as Id<"services">;

/** Create a service (expects your existing shape on the Convex side). */
export async function createService(
  input: {
    name: string;
    isPublic: boolean;
    description?: string;
    price?: number;
    deliveryTime?: string;
  },
  opts?: { revalidate?: string }
) {
  await fetchMutation(api.services.create, input);
  if (opts?.revalidate) revalidatePath(opts.revalidate);
}

/** Update a service by id (partial patch). */
export async function updateService(
  id: string,
  patch: Partial<{
    name: string;
    isPublic: boolean;
    description: string;
    price: number;
    deliveryTime: string;
  }>,
  opts?: { revalidate?: string }
) {
  await fetchMutation(api.services.update, { id: asServiceId(id), ...patch });
  if (opts?.revalidate) revalidatePath(opts.revalidate);
}

/** Archive (soft-delete) a service — preferred over hard delete. */
export async function archiveService(
  id: string,
  opts?: { revalidate?: string }
) {
  await fetchMutation(api.services.archive, { id: asServiceId(id) });
  if (opts?.revalidate) revalidatePath(opts.revalidate);
}

/** Back-compat: keep old callers working by forwarding remove -> archive. */
export async function removeService(
  id: string,
  opts?: { revalidate?: string }
) {
  await archiveService(id, opts);
}

/** Optional: restore from archive if your Convex module supports it. */
export async function restoreService(
  id: string,
  opts?: { revalidate?: string }
) {
  // If you have `services.restore` on the server, this will just work.
  await fetchMutation(api.services.restore, { id: asServiceId(id) });
  if (opts?.revalidate) revalidatePath(opts.revalidate);
}

/** Fetch a single service if you need it in server components. */
export async function getService(id: string) {
  return await fetchQuery(api.services.getById, { id: asServiceId(id) });
}
