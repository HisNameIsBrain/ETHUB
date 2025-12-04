/* scripts/sync-services.ts
   Scrape iosfiles.com/imei-services and sync to ./servicesRows.ts
   Run with: npx tsx scripts/sync-services.ts
*/
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseUrl } from "node:url";
import slugify from "slugify";
import * as cheerio from "cheerio";
import { setTimeout as sleep } from "node:timers/promises";
import { fetch } from "undici";

type Row = {
  slug: string;
  title: string;
  category: string;
  deliveryTime: string;
  priceCents: number;
  currency: "USD";
  sourceUrl: string;
  tags: string[];
};

const LIST_URL = "https://www.iosfiles.com/imei-services";
const OUT_FILE = resolve(process.cwd(), "servicesRows.ts");
const CATEGORY = "IMEI services" as const;

function toSlug(s: string) {
  return slugify(s, { lower: true, strict: true, trim: true });
}

function priceTextToCents(txt: string | undefined): number {
  if (!txt) return 0;
  // common patterns: "$0.25", "0.25$", "0.25 USD"
  const m = txt.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  const dollars = parseFloat(m[1]);
  if (Number.isNaN(dollars)) return 0;
  return Math.round(dollars * 100);
}

function safeTrim(s?: string | null) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

/** Very dumb parser that works against typical Prestashop-like grids. */
async function scrapeList(): Promise<Row[]> {
  const res = await fetch(LIST_URL, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Heuristic selectors for product tiles
  const items: Row[] = [];

  $(".product-miniature, .js-product, .product").each((_i, el) => {
    const $el = $(el);

    // Link + title
    const $link = $el.find("a.product-thumbnail, a.thumbnail, a.product-title, h2 a").first();
    const href = $link.attr("href") || $el.find("a").attr("href") || "";
    const title =
      safeTrim($el.find(".product-title, h2, h3, a").first().text()) ||
      safeTrim($link.text());

    if (!href || !title) return;

    // Price
    const priceTxt =
      safeTrim(
        $el
          .find(".price, .product-price, .current-price, .price_amount, .product-price-and-shipping")
          .first()
          .text()
      ) || undefined;
    const priceCents = priceTextToCents(priceTxt);

    // Delivery time — look for small helper text
    const deliveryTxt =
      safeTrim(
        $el
          .find(
            ".delivery, .delivery-time, .product-delivery, .product-description, .product-desc, .hook-reviews, .product-short-description"
          )
          .first()
          .text()
      ) || "Varies";

    // Normalize URL to absolute
    const url = new URL(href, LIST_URL).toString();

    // Slug by URL path if looks stable, else by title
    const urlSlug = (() => {
      try {
        const { pathname } = parseUrl(url);
        const last = pathname?.split("/").filter(Boolean).pop();
        if (last && /[a-z]/i.test(last)) return toSlug(last);
      } catch {}
      return toSlug(title);
    })();

    // Filter: only “IMEI” category; leave server to filter “isPublic” if you track that
    items.push({
      slug: urlSlug,
      title,
      category: CATEGORY,
      deliveryTime: deliveryTxt,
      priceCents,
      currency: "USD",
      sourceUrl: url,
      tags: deriveTags(title),
    });
  });

  // De-dupe by slug, prefer richer price/delivery
  const bySlug = new Map<string, Row>();
  for (const row of items) {
    const old = bySlug.get(row.slug);
    if (!old) bySlug.set(row.slug, row);
    else {
      const better =
        (row.priceCents ?? 0) > 0 || safeTrim(row.deliveryTime) !== "Varies" ? row : old;
      bySlug.set(row.slug, better);
    }
  }

  // If the page is lazy-loaded, you could try to follow pagination or sleep and retry XHR endpoints; keeping simple.
  return [...bySlug.values()];
}

function deriveTags(title: string): string[] {
  const t = title.toLowerCase();
  const tags = new Set<string>();
  ["checker", "icloud", "fmi", "gsma", "simlock", "carrier", "unlock", "mdm", "warranty", "activation", "macbook", "serial", "policy", "ios"].forEach(
    (k) => {
      if (t.includes(k)) tags.add(k);
    }
  );
  return [...tags];
}

// Read existing rows to preserve your custom tags/currency/etc during merge
function readExisting(): Row[] {
  if (!existsSync(OUT_FILE)) return [];
  const src = readFileSync(OUT_FILE, "utf8");
  const m = src.match(/export const rows\s*=\s*(\[[\s\S]*\]);?/);
  if (!m) return [];
  // Unsafe eval avoided: parse as JSON-ish by replacing trailing comments and keys
  const body = m[1]
    // remove TS comments
    .replace(/\/\/.*$/gm, "")
    // quote keys if needed (best-effort)
    .replace(/(\w+):/g, '"$1":');
  try {
    return JSON.parse(body) as Row[];
  } catch {
    // Fall back to nothing if file is un-parseable
    return [];
  }
}

function mergeRows(existing: Row[], scraped: Row[]): Row[] {
  const current = new Map(existing.map((r) => [r.slug, r]));
  const next = new Map<string, Row>();

  for (const r of scraped) {
    const prev = current.get(r.slug);
    if (prev) {
      next.set(r.slug, {
        // keep your manual fields if present
        slug: r.slug,
        title: r.title || prev.title,
        category: prev.category ?? r.category,
        deliveryTime: r.deliveryTime || prev.deliveryTime,
        priceCents: r.priceCents > 0 ? r.priceCents : prev.priceCents,
        currency: prev.currency ?? "USD",
        sourceUrl: r.sourceUrl || prev.sourceUrl,
        tags: prev.tags?.length ? prev.tags : r.tags,
      });
    } else {
      next.set(r.slug, r);
    }
  }

  // Optionally, keep items that disappeared (comment out instead). Here we drop them.
  return [...next.values()].sort((a, b) => a.title.localeCompare(b.title));
}

function toTs(rows: Row[]): string {
  // pretty TS emitter with inline $ comments
  const lines = rows.map((r) => {
    const dollars = (r.priceCents / 100).toFixed(2);
    return `  {
    slug: ${JSON.stringify(r.slug)},
    title: ${JSON.stringify(r.title)},
    category: ${JSON.stringify(r.category)},
    deliveryTime: ${JSON.stringify(r.deliveryTime)},
    priceCents: ${r.priceCents}, // $${dollars}
    currency: "USD",
    sourceUrl: ${JSON.stringify(r.sourceUrl)},
    tags: ${JSON.stringify(r.tags)},
  }`;
  });
  return `// AUTO-GENERATED FILE — edit tags/category manually if needed.
// Run: npx tsx scripts/sync-services.ts
export type ServiceRow = {
  slug: string;
  title: string;
  category: string;
  deliveryTime: string;
  priceCents: number;
  currency: "USD";
  sourceUrl: string;
  tags: string[];
};

export const rows: ServiceRow[] = [
${lines.join(",\n")}
];
`;
}

async function main() {
  console.log("Scraping:", LIST_URL);
  const scraped = await scrapeList();
  console.log(`Found ${scraped.length} items`);

  const existing = readExisting();
  console.log(`Merging with existing rows (${existing.length})`);
  const merged = mergeRows(existing, scraped);

  const ts = toTs(merged);
  writeFileSync(OUT_FILE, ts, "utf8");
  console.log("Wrote", OUT_FILE);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
