// convex/scrape_iosfiles.ts
import { action } from "./_generated/server";
import { v } from "convex/values";

/** Normalize text -> slug */
function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function dollarsToCents(s: string): number {
  const m = s.match(/\$?\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (!m) return 0;
  return Math.round(parseFloat(m[1].replace(/,/g, "")) * 100);
}

/** Extract rows like: "Service ... Delivery time ... Price" tables */
function parseServices(html: string, sourceUrl: string) {
  const rows: Array<{
    slug: string;
    title: string;
    category: string;
    deliveryTime: string;
    priceCents: number;
    currency: string;
    sourceUrl: string;
    notes?: string;
    tags?: string[];
  }> = [];

  // Identify category blocks by headings around the table
  // e.g., "Rent Tools", "IMEI services", etc.
  const categoryBlocks = html.split(/<h\d[^>]*>|<\/h\d>/i);
  // Fallback: whole page scan if heading split fails
  const scanTargets = categoryBlocks.length > 1 ? categoryBlocks : [html];

  for (const block of scanTargets) {
    // Guess category from preceding text
    const catMatch = block.match(/^(?:[^<]{0,120})/);
    const categoryGuess = (catMatch?.[0] ?? "").replace(/\s+/g, " ").trim() || "IMEI services";

    // Find table-like lines (service, delivery, price) in plain text
    const text = block
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Heuristic: capture triplets like "... Instant $9.00"
    const tripletRe = /([A-Za-z0-9\[\]\-\(\)\/\.\+ :,&]+?)\s+(Instant|INSTANT|[0-9]+-?[0-9]*\s*(?:Min(?:utes)?|Hours?|Days?))\s+\$[\d\.,]+/g;
    let m: RegExpExecArray | null;
    while ((m = tripletRe.exec(text))) {
      const title = m[1].trim();
      const delivery = m[2].replace(/INSTANT/i, "Instant");
      // Find nearest price to this match window
      const tail = text.slice(m.index, m.index + m[0].length + 40);
      const priceMatch = tail.match(/\$\s*[\d\.,]+/);
      const priceCents = dollarsToCents(priceMatch ? priceMatch[0] : "$0");
      const row = {
        slug: toSlug(title),
        title,
        category: /rent/i.test(categoryGuess) ? "Rent Tools" : "IMEI services",
        deliveryTime: delivery,
        priceCents,
        currency: "USD",
        sourceUrl,
      };
      // De-dupe by slug
      if (!rows.some(r => r.slug === row.slug)) rows.push(row);
    }
  }

  // Harden known items from the page (ensures at least these import even if parsing shifts)
  // CHEETAH TOOL RENT block etc. (seen publicly)
  const known = [
    ["CHEETAH TOOL RENT [ 4 Hours ]", "Instant", "$8.00", "Rent Tools"],
    ["MDM FIX TOOL RENT [ 6 Hours ]", "Instant", "$9.00", "Rent Tools"],
    ["UNLOCK TOOL RENT [6 Hour]", "Instant", "$8.00", "Rent Tools"],
    ["KG Killer Tool Rent [4 Hours ]", "5-20 Minutes", "$8.00", "Rent Tools"],
    ["TSM TOOL RENT 12 Hour", "Minutes", "$9.00", "Rent Tools"],
    ["Hydra Tool Rent (Without Dongle) [12 Hour]", "Minutes", "$9.70", "Rent Tools"],
  ];
  for (const [title, delivery, price, category] of known) {
    const slug = toSlug(title);
    if (!rows.some(r => r.slug === slug)) {
      rows.push({
        slug,
        title,
        category,
        deliveryTime: delivery,
        priceCents: dollarsToCents(String(price)),
        currency: "USD",
        sourceUrl,
      });
    }
  }

  return rows;
}

export const fetchAndUpsert = action({
  args: {},
  handler: async (ctx) => {
    const sourceUrl = "https://www.iosfiles.com/imei-services";
    const res = await fetch(sourceUrl, { method: "GET" });
    if (!res.ok) throw new Error(`fetch_failed_${res.status}`);
    const html = await res.text();

    const rows = parseServices(html, sourceUrl);
    if (!rows.length) return { upserted: 0, warning: "No rows parsed" };

    // Reuse your services.upsertBatch
    // @ts-ignore — call within same action boundary if exported here
    const upsert = await ctx.runAction("services:upsertBatch", { rows });
    return upsert;
  },
});
