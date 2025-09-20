// conve@/lib/search.ts
export type ServiceLike = {
  title?: string;
  category?: string;
  deliveryTime?: string;
  notes?: string | null;
  tags?: string[] | null;
};

export function buildServiceSearch(s: ServiceLike) {
  const parts = [
    s?.title ?? "",
    s?.category ?? "",
    s?.deliveryTime ?? "",
    s?.notes ?? "",
    ...(s?.tags ?? []),
  ];
  return parts.join(" ").toLowerCase();
}
