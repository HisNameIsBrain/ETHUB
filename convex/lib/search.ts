// convex/lib/search.ts
/** Minimal, stable search blob builder used by services. */
export function buildServiceSearch(input: {
  title?: string;
  notes?: string;
  deliveryTime?: string;
  tags?: string[];
}) {
  const parts: string[] = [];
  if (input.title) parts.push(input.title);
  if (input.notes) parts.push(input.notes);
  if (input.deliveryTime) parts.push(input.deliveryTime);
  if (Array.isArray(input.tags)) parts.push(input.tags.join(" "));
  return parts
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
