import { action, mutation, type ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import * as cheerio from "cheerio";

/* =========================
   Types & Validators
   ========================= */

export const ServiceRowV = v.object({
  slug: v.string(),
  title: v.string(),
  category: v.string(),       // e.g. "IMEI services"
  deliveryTime: v.string(),   // e.g. "0-1 min" | "Instant" | "Varies"
  priceCents: v.number(),     // integer cents
  currency: v.literal("USD"), // keep USD for now
  sourceUrl: v.string(),
  tags: v.array(v.string()),
});

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

/* =========================
   Mutations (DB writes)
   ========================= */

export const upsertMany = mutation({
  args: { rows: v.array(ServiceRowV) },
  handler: async (ctx, { rows }) => {
    for (const r of rows) {
      const existing = await ctx.db
        .query("services")
        .withIndex("by_slug", (q) => q.eq("slug", r.slug))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: r.title,
          category: r.category,
          deliveryTime: r.deliveryTime,
          priceCents: r.priceCents,
          currency: r.currency,
          sourceUrl: r.sourceUrl,
          tags: r.tags,
          isPublic: true,
          archived: false,
        });
      } else {
        await ctx.db.insert("services", {
          ...r,
          isPublic: true,
          archived: false,
        });
      }
    }
  },
});

export const archiveMissing = mutation({
  args: { keepSlugs: v.array(v.string()) },
  handler: async (ctx, { keepSlugs }) => {
    const keep = new Set(keepSlugs);
    const cur = await ctx.db.query("services").collect();
    for (const s of cur) {
      if (s.isPublic && !keep.has(s.slug)) {
        await ctx.db.patch(s._id, { archived: true });
      }
    }
  },
});

/* =========================
   Actions (web fetch / ingest)
   ========================= */

/**
 * Scrape https://iosfiles.com/imei-services and return { files: ServiceRow[] }.
 * Also upserts into the `services` table and archives missing rows.
 */
export const importFromIosfiles = action({
  args: {},
  handler: async (ctx: ActionCtx) => {
    const LIST_URL = "https://iosfiles.com/imei-services";
    const html = await fetchText(LIST_URL);
    const services = scrapeCatalog(html, LIST_URL);

    // Upsert to DB
    await ctx.runMutation<typeof upsertMany>("scrape_iosfiles:upsertMany", {
      rows: services,
    });

    // Archive things no longer on the page
    await ctx.runMutation<typeof archiveMissing>("scrape_iosfiles:archiveMissing", {
      keepSlugs: services.map((s) => s.slug),
    });

    // Return wrapped object (your requested shape)
    return { files: services };
  },
});

/**
 * Action: ingest files (CSV or JSON) from a client and upsert.
 * Returns { files: ServiceRow[] } after normalization.
 */
export const ingestIosFiles = action({
  args: {
    files: v.array(
      v.object({
        name: v.string(),
        text: v.string(),           // raw file text
        mime: v.optional(v.string()) // "text/csv" | "application/json" | ...
      })
    ),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, { files, batchSize }) => {
    const BATCH = Math.max(1, Math.min(batchSize ?? 200, 1000));

    const all: ServiceRow[] = [];
    for (const f of files) {
      const lower = f.name.toLowerCase();
      const isJson = (f.mime?.includes("json") ?? false) || lower.endsWith(".json");
      const isCsv  = (f.mime?.includes("csv") ?? false) || lower.endsWith(".csv");

      let rows: Record<string, any>[] = [];
      try {
        if (isJson) {
          const data = JSON.parse(f.text);
          rows = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
        } else if (isCsv) {
          rows = parseCsv(f.text);
        } else {
          try {
            const data = JSON.parse(f.text);
            rows = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
          } catch {
            rows = parseCsv(f.text);
          }
        }
      } catch (e: any) {
        throw new Error(`Failed to parse "${f.name}": ${e?.message ?? String(e)}`);
      }

      // Normalize each incoming row to ServiceRow, skipping invalids
      const normalized: ServiceRow[] = [];
      for (const r of rows) {
        const n = normalizeIncomingRow(r);
        if (n) normalized.push(n);
      }

      all.push(...normalized);
    }

    // Optional chunked upsert
    for (let i = 0; i < all.length; i += BATCH) {
      const chunk = all.slice(i, i + BATCH);
      await ctx.runMutation<typeof upsertMany>("scrape_iosfiles:upsertMany", { rows: chunk });
    }

    // Optionally archive missing after ingest:
    // await ctx.runMutation<typeof archiveMissing>("scrape_iosfiles:archiveMissing", {
    //   keepSlugs: all.map((s) => s.slug),
    // });

    return { files: all };
  },
});

/* =========================
   Scraper (Cheerio)
   ========================= */

function scrapeCatalog(html: string, baseUrl: string): ServiceRow[] {
  const $ = cheerio.load(html);
  // Strategy: find links to individual services, infer delivery & price from nearby text.
  const anchors = $('a[href*="/imei-service/"]');

  const seen = new Set<string>();
  const items: ServiceRow[] = [];

  anchors.each((_i, el) => {
    const a = $(el);
    const href = a.attr("href") || "";
    const abs = new URL(href, baseUrl).toString();
    const rawTitle = cleanText(a.text());
    if (!href || !rawTitle) return;

    const lineText = cleanText(
      a.parent().text() ||
      `${a.text()} ${a.next().text()} ${a.parent().next().text()}`
    );

    const deliveryTime = extractDelivery(lineText) ?? "Varies";
    const priceCents = extractPriceCents(lineText) ?? 0;

    const slug = slugFromUrlOrTitle(abs, rawTitle);
    if (seen.has(slug)) return;
    seen.add(slug);

    items.push({
      slug,
      title: normalizeTitle(rawTitle),
      category: "IMEI services",
      deliveryTime,
      priceCents,
      currency: "USD",
      sourceUrl: abs,
      tags: deriveTags(rawTitle),
    });
  });

  // de-dupe already handled with seen; sort for deterministic output
  items.sort((a, b) => a.title.localeCompare(b.title));
  return items;
}

/* =========================
   Helpers
   ========================= */

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (ETHUB/Convex sync)" },
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

// Quasi-stable slug: prefer last path segment, else title
function slugFromUrlOrTitle(absUrl: string, title: string): string {
  try {
    const last = new URL(absUrl).pathname.split("/").filter(Boolean).pop();
    if (last && /[a-z0-9-]/i.test(last)) return toSlug(last);
  } catch {}
  return toSlug(title);
}

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function cleanText(s?: string | null): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function normalizeTitle(t: string): string {
  return t.replace(/\s-\s+/g, " - ").trim();
}

// Extract "$0.25" / "0.25 USD" / "Price: 2.60" → cents
function extractPriceCents(line: string): number | undefined {
  const m = line.replace(",", ".").match(/(\d+(?:\.\d{1,2})?)/);
  if (!m) return undefined;
  const dollars = parseFloat(m[1]);
  if (Number.isNaN(dollars)) return undefined;
  return Math.round(dollars * 100);
}

function extractDelivery(line: string): string | undefined {
  const m = line.match(
    /\b(instant|0-?\d+\s*min(?:utes)?|[0-9]+-?[0-9]*\s*(?:min|minutes|h|hours|day|days)|varies|1-5\s*minutes?)\b/i
  );
  return m?.[0];
}

function deriveTags(title: string): string[] {
  const t = title.toLowerCase();
  const tags = new Set<string>();
  [
    "checker",
    "icloud",
    "fmi",
    "gsma",
    "simlock",
    "carrier",
    "unlock",
    "mdm",
    "warranty",
    "activation",
    "mac",
    "ipad",
    "iphone",
    "policy",
    "ios",
    "bypass",
    "tool",
    "rent",
  ].forEach((k) => {
    if (t.includes(k)) tags.add(k);
  });
  return [...tags];
}

/* =========================
   CSV / JSON normalization
   ========================= */

/**
 * Minimal CSV parser that honors quoted fields and commas in quotes.
 * Expects the first line to be headers.
 */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => { cur.push(field); field = ""; };
  const pushRow = () => { rows.push(cur); cur = []; };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        const peek = text[i + 1];
        if (peek === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") pushField();
      else if (c === "\n") { pushField(); pushRow(); }
      else if (c === "\r") { /* swallow CR */ }
      else field += c;
    }
  }
  // flush last field/row
  pushField();
  if (cur.length > 1 || (cur.length === 1 && cur[0] !== "")) pushRow();

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  const out: Record<string, string>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) obj[headers[c]] = (row[c] ?? "").trim();
    out.push(obj);
  }
  return out;
}

/**
 * Normalize arbitrary incoming object to ServiceRow.
 * Accepts either:
 *  - priceCents (preferred), or
 *  - price (dollars -> converted to cents)
 * If title/sourceUrl are missing, row is skipped.
 */
function normalizeIncomingRow(row: Record<string, any>): ServiceRow | null {
  const num = (x: any) => (x === "" || x == null ? undefined : Number(x));
  const tags = Array.isArray(row.tags)
    ? row.tags
    : typeof row.tags === "string"
      ? row.tags.split("|").map((s) => s.trim()).filter(Boolean)
      : [];

  const priceCents =
    num(row.priceCents) ??
    (num(row.price) != null ? Math.round(Number(row.price) * 100) : 0);

  const title: string | undefined = row.title ?? row.name;
  const sourceUrl: string | undefined = row.sourceUrl ?? row.url ?? row.link;
  if (!title || !sourceUrl) return null;

  const slug: string = row.slug
    ? toSlug(String(row.slug))
    : slugFromUrlOrTitle(String(sourceUrl), String(title));

  return {
    slug,
    title: String(title),
    category: String(row.category ?? "IMEI services"),
    deliveryTime: String(row.deliveryTime ?? "Varies"),
    priceCents: Number.isFinite(priceCents) ? Number(priceCents) : 0,
    currency: "USD",
    sourceUrl: String(sourceUrl),
    tags: tags.map(String),
  };
}
