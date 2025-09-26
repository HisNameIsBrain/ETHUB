import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/* ---------------------------- tiny CSV parser ---------------------------- */
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
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") pushField();
      else if (c === "\n") { pushField(); pushRow(); }
      else if (c === "\r") { /* ignore */ }
      else field += c;
    }
  }
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

/* ------------------------------ normalizer ------------------------------ */
function normalizeRow(row: Record<string, any>) {
  const num = (x: any) => (x === "" || x == null ? undefined : Number(x));
  const bool = (x: any) =>
    x === true || x === "true" || x === "TRUE" || x === "1" ? true :
    x === false || x === "false" || x === "FALSE" || x === "0" ? false : undefined;

  const tags =
    typeof row.tags === "string"
      ? row.tags.split("|").map((s) => s.trim()).filter(Boolean)
      : Array.isArray(row.tags)
      ? row.tags
      : undefined;

  const title = (row.title ?? row.name ?? "").toString().trim();

  return {
    slug: row.slug ? String(row.slug).trim() : undefined,
    title: title || undefined,
    notes: row.notes ?? row.description ?? undefined,
    tags,
    category: row.category ?? undefined,
    deliveryTime: row.deliveryTime ?? undefined,
    priceCents:
      row.priceCents != null
        ? num(row.priceCents)
        : row.price != null
        ? (typeof row.price === "number" ? Math.round(row.price * 100) : (num(row.price) != null ? Math.round(Number(row.price) * 100) : undefined))
        : undefined,
    currency: row.currency ?? "USD",
    sourceUrl: row.sourceUrl ?? undefined,
    isPublic: bool(row.isPublic),
    archived: bool(row.archived),
  };
}

/* ----------------------------- main action ------------------------------ */
export const ingestIosFiles = action({
  args: {
    files: v.array(
      v.object({
        name: v.string(),
        text: v.string(),
        mime: v.optional(v.string()),
      })
    ),
    archiveMissing: v.optional(v.boolean()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, { files, archiveMissing = false, batchSize }) => {
    const BATCH = Math.max(1, Math.min(batchSize ?? 200, 1000));

    let totalRows = 0;
    let upserts = 0;
    const keepSlugs = new Set<string>();
    const perFile: Array<{ name: string; rows: number }> = [];

    for (const f of files) {
      const lower = f.name.toLowerCase();
      const isJson = (f.mime?.includes("json") ?? false) || lower.endsWith(".json");
      const isCsv  = (f.mime?.includes("csv") ?? false) || lower.endsWith(".csv");

      let rows: any[] = [];
      try {
        if (isJson) {
          const data = JSON.parse(f.text);
          rows = Array.isArray(data) ? data : (Array.isArray((data as any).items) ? (data as any).items : []);
        } else if (isCsv) {
          rows = parseCsv(f.text);
        } else {
          try {
            const data = JSON.parse(f.text);
            rows = Array.isArray(data) ? data : (Array.isArray((data as any).items) ? (data as any).items : []);
          } catch {
            rows = parseCsv(f.text);
          }
        }
      } catch (e: any) {
        throw new Error(`Failed to parse "${f.name}": ${e?.message ?? String(e)}`);
      }

      const items = rows.map((r) => normalizeRow(r)).filter((r) => r.title && typeof r.title === "string");
      totalRows += items.length;

      for (const it of items) {
        const s = it.slug;
        if (s && typeof s === "string" && s.trim()) keepSlugs.add(s.trim());
      }

      for (let i = 0; i < items.length; i += BATCH) {
        const chunk = items.slice(i, i + BATCH);
        for (const it of chunk) {
          await ctx.runMutation(api.services.upsert, it);
          upserts++;
        }
      }

      perFile.push({ name: f.name, rows: items.length });
    }

    let archived = 0;
    if (archiveMissing) {
      const listing = await ctx.runQuery(api.services.fetch, {
        needle: undefined,
        offset: 0,
        limit: 10000,
        sort: "created_desc",
        onlyPublic: true,
      });

      for (const s of listing.services) {
        const slug: string = (s as any).slug ?? "";
        if (!slug) continue;
        if (!keepSlugs.has(slug)) {
          await ctx.runMutation(api.services.update, { id: (s as any)._id, archived: true, isPublic: false });
          archived++;
        }
      }
    }

    return {
      files: perFile,
      totalRows,
      upserts,
      archived,
      keptSlugs: keepSlugs.size,
      batchSize: BATCH,
    };
  },
});
