#!/usr/bin/env bash
set -euo pipefail

mkdir -p lib

cat > lib/db.ts <<'TS'
/**
 * Lightweight, build-safe data helpers.
 * No external DB imports; swap the in-memory arrays with real fetch/DB calls when ready.
 */

export type Service = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  deliveryTime?: string;
  slug?: string;
  isPublic?: boolean;
  archived?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  slug?: string;
  isPublic?: boolean;
  archived?: boolean;
  createdAt: number;
  updatedAt: number;
};

const PAGE_SIZE = 10;

/** ---- TEMP DATA (replace with real queries) ---- */
const __services__: Service[] = [];
const __products__: Product[] = [];

/** ---- helpers ---- */
function norm(s: unknown) {
  return (typeof s === "string" ? s : "").trim().toLowerCase();
}
function matches(q: string, ...fields: Array<string | undefined>) {
  if (!q) return true;
  const n = norm(q);
  return fields.some((f) => norm(f).includes(n));
}
function paginate<T>(items: T[], offset: number, limit: number) {
  const start = Math.max(0, Number.isFinite(offset) ? offset : 0);
  const end = start + limit;
  const slice = items.slice(start, end);
  const newOffset = end < items.length ? end : null;
  return { slice, newOffset };
}

/** ---- public API ---- */
export async function getServices(search: string, offset: number) {
  // TODO: replace the source array with your real data fetch.
  // Example (Convex): call your public query and map to Service[].
  // Example (Prisma): const rows = await prisma.service.findMany({ ... });

  const list = __services__.filter((s) =>
    matches(search, s.name, s.description, s.slug)
  );

  const totalServices = list.length;
  const { slice, newOffset } = paginate<Service>(list, offset, PAGE_SIZE);

  return {
    services: slice,
    newOffset,
    totalServices,
  };
}

export async function getServiceById(serviceId: string) {
  // TODO: wire to your real DB call
  const found = __services__.find((s) => s.id === serviceId || s.slug === serviceId);
  return found ?? null;
}

export async function getProducts(search: string, offset: number) {
  // Back-compat for any pages/components still using products.
  const list = __products__.filter((p) =>
    matches(search, p.name, p.description, p.slug)
  );

  const totalProducts = list.length;
  const { slice, newOffset } = paginate<Product>(list, offset, PAGE_SIZE);

  return {
    products: slice,
    newOffset,
    totalProducts,
  };
}

/** ---- notes for wiring real data ----
 * 1) Replace __services__/__products__ with actual fetch/DB results.
 * 2) Keep return shapes stable:
 *    - getServices: { services, newOffset, totalServices }
 *    - getProducts: { products, newOffset, totalProducts }
 * 3) Keep PAGE_SIZE consistent with your UI (or make it a param).
 */
TS

echo "✓ Wrote lib/db.ts"
