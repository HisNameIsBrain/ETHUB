// Normalize vendor-ish condition labels into your schema union.
export const ALLOWED = ["OEM","OEM-Pull","Refurbished","Premium","Economy","Unknown"] as const;
export type AllowedCondition = typeof ALLOWED[number];

export function normalizeCondition(input?: string): AllowedCondition {
  if (!input) return "Unknown";
  const base = input.split("(")[0].trim(); // strips "(AAA)", "(HQ+)", etc.
  if ((ALLOWED as readonly string[]).includes(base as any)) return base as AllowedCondition;

  const l = input.toLowerCase();
  if (/(aaa|oem\s*\+|premium|soft\s*oled|hard\s*oled|hq\+)/.test(l)) return "Premium";
  if (/(copy|aftermarket|incell|tft|hq|hq\+|cellularline)/.test(l)) return "Economy";
  if (/(pull|oem-pull)/.test(l)) return "OEM-Pull";
  if (/(refurb|renewed)/.test(l)) return "Refurbished";
  if (/\boem\b/.test(l)) return "OEM";
  return "Unknown";
}
