// convex/lib/search.ts
export function buildServiceSearch(s: any): string {
  if (!s) return "";
  const title = s.title ?? "";
  const category = s.category ?? "";
  const deliveryTime = s.deliveryTime ?? "";
  const notes = s.notes ?? "";
  const tags = Array.isArray(s.tags) ? s.tags.join(" ") : (s.tags ?? "");
  return [title, category, deliveryTime, notes, tags].join(" ").toLowerCase().trim();
}
