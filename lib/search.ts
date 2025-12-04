export type ServiceSearchInput = {
  title?: string;
  category?: string;
  deliveryTime?: string;
  notes?: string | null;
  tags?: string[] | null;
};

/**
 * Build a normalized lowercase `search` string by concatenating
 * relevant fields of a service record.
 */
export function buildServiceSearch(s: ServiceSearchInput): string {
  return [
    s?.title ?? "",
    s?.category ?? "",
    s?.deliveryTime ?? "",
    s?.notes ?? "",
    ...(s?.tags ?? []),
  ]
    .join(" ")
    .toLowerCase()
    .trim();
}
