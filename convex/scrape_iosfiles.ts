// convex/scrape_iosfiles.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Minimal CSV parser that honors quoted fields and commas inside quotes.
 * Expects the first line to be headers.
 */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    cur.push(field);
    field = "";
  };
  const pushRow = () => {
    rows.push(cur);
    cur = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        const peek = text[i + 1];
        if (peek === '"') {
          field += '"'; // escaped quote
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        pushField();
      } else if (c === "\n") {
        pushField();
        pushRow();
      } else if (c === "\r") {
        // normalize CRLF -> handled by \n
      } else {
        field += c;
      }
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
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = (row[c] ?? "").trim();
    }
    out.push(obj);
  }
  return out;
}

/**
 * Normalize a parsed CSV/JSON row to the shape expected by services.importServices.
 * Accepts either {title, description, price, ...} or {title, notes, priceCents, ...}.
 */
function normalizeRow(row: Record<string, any>) {
  const num = (v: any) => (v === "" || v == null ? undefined : Number(v));
  const bool = (v: any) =>
    v === true || v === "true" || v === "TRUE" || v === "1" ? true :
    v === false || v === "false" || v === "FALSE" || v === "0" ? false : undefined;

  const tags =
    typeof row.tags === "string"
      ? row.tags.split("|").map((s) => s.trim()).filter(Boolean)
      : Array.isArray(row.tags)
      ? row.tags
      : undefined;

  return {
    title: row.title ?? row.name,
    description: row.description, // importer maps description->notes
    notes: row.notes,
    price: num(row.price),
    priceCents: num(row.priceCents),
    currency: row.currency,
    category: row.category,
    deliveryTime: row.deliveryTime,
    tags,
    sourceUrl: row.sourceUrl,
    isPublic: bool(row.isPublic),
    archived: bool(row.archived),
    slug: row.slug,
  };
}

/**
 * Action: ingest files picked on iOS (Files app).
 * The client should read file text and send it here.
 */
export const ingestIosFiles = action({
  args: {
    files: v.array(
      v.object({
        name: v.string(),
        // raw text contents of the file
        text: v.string(),
        // optional MIME (e.g. "text/csv" or "application/json")
        mime: v.optional(v.string()),
      })
    ),
    // optional: limit batch size
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, { files, batchSize }) => {
    const BATCH = Math.max(1, Math.min(batchSize ?? 200, 1000));
    let total = 0;
    let inserted = 0;
    let updated = 0;
    const perFile: Array<{ name: string; rows: number; inserted: number; updated: number }> = [];

    for (const f of files) {
      const lower = f.name.toLowerCase();
      const isJson = (f.mime?.includes("json") ?? false) || lower.endsWith(".json");
      const isCsv  = (f.mime?.includes("csv") ?? false) || lower.endsWith(".csv");

      let rows: any[] = [];
      try {
        if (isJson) {
          const data = JSON.parse(f.text);
          rows = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
        } else if (isCsv) {
          const csvRows = parseCsv(f.text);
          rows = csvRows;
        } else {
          // try to auto-detect: JSON first, fallback to CSV
          try {
            const data = JSON.parse(f.text);
            rows = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
          } catch {
            rows = parseCsv(f.text);
          }
        }
      } catch (e: any) {
        throw new Error(`Failed to parse "${f.name}": ${e?.message ?? String(e)}`);
      }

      // normalize
      const items = rows.map((r) => normalizeRow(r)).filter((r) => r.title && typeof r.title === "string");
      total += items.length;

      // batch call importServices
      for (let i = 0; i < items.length; i += BATCH) {
        const chunk = items.slice(i, i + BATCH);
        const res = await ctx.runMutation(api.services.importServices, { items: chunk });
        inserted += res.inserted;
        updated += res.updated;
      }

      perFile.push({ name: f.name, rows: items.length, inserted: 0, updated: 0 }); // aggregate totals already tracked
    }

    return { files: perFile, inserted, updated, total, batchSize: BATCH };
  },
});
