import { action, mutation, type ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import * as cheerio from "cheerio";

// ---- shared types ----
export const ServiceRow = {
  slug: v.string(),
  title: v.string(),
  category: v.string(),
  deliveryTime: v.string(),
  priceCents: v.number(),
  currency: v.literal("USD"),
  sourceUrl: v.string(),
  tags: v.array(v.string()),
  // Optional in payload; mutation sets these.
  // isPublic: v.boolean(),
  // archived: v.boolean(),
};

// ---- upsert mutation ----
export const upsertMany = mutation({
  args: { rows: v.array(v.object(ServiceRow)) },
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

// ---- scraper action (fetch + parse + upsert) ----
export const importFromIosfiles = action({
  args: {},
  handler: async (ctx: ActionCtx) => {
    const LIST_URL = "https://iosfiles.com/imei-services";

    // Fetch HTML
    const res = await fetch(LIST_URL, {
      headers: { "user-agent": "Mozilla/5.0 (ETHUB sync)" },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${LIST_URL}: ${res.status}`);
    }
    const html = await res.text();

    // Parse
    const $ = cheerio.load(html);

    // Heuristic: each service is an <a> going to /imei-service/...
    // On this page there are many product lines; after each link, the
    // same line contains Delivery Time and Price.
    const anchors = $('a[href*="/imei-service/"]');

    const seen = new Set<string>();
    const rows: Array<{
      slug: string;
      title: string;
      category: string;
      deliveryTime: string;
      priceCents: number;
      currency: "USD";
      sourceUrl: string;
      tags: string[];
    }> = [];

    anchors.each((_i, el) => {
      const a = $(el);
      const href = a.attr("href") || "";
      const abs = new URL(href, LIST_URL).toString();
      const title = a.text().trim();

      if (!title || !href) return;

      // Extract delivery+price from the same logical line (siblings text)
      const lineText = (() => {
        // parent line text usually holds: "<Title>  <Delivery>  $Price"
        const parentText = a.parent().text() || "";
        if (parentText.toLowerCase().includes(title.toLowerCase())) {
          return parentText;
        }
        // fallback to closest text around the link
        const maybe = `${a.text()} ${a.next().text()} ${a.parent().next().text()}`;
        return maybe;
      })()
        .replace(/\s+/g, " ")
        .trim();

      const deliveryMatch = lineText.match(
        /\b(instant|in ?stant|0-?\d+\s*min(?:utes)?|[0-9]+-?[0-9]*\s*(?:min|minutes|h|hours|days?)|[0-9]+\s*min|varies|1-5\s*days)\b/i
      );
      const deliveryTime = deliveryMatch ? deliveryMatch[0] : "Varies";

      const priceMatch = lineText.match(/\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/);
      const priceCents = priceMatch ? Math.round(parseFloat(priceMatch[1]) * 100) : 0;

      // slug from path tail or title
      const slug = (() => {
        try {
          const u = new URL(abs);
          const last = u.pathname.split("/").filter(Boolean).pop()!;
          if (/[a-z0-9-]/i.test(last)) return toSlug(last);
        } catch {}
        return toSlug(title);
      })();

      if (seen.has(slug)) return;
      seen.add(slug);

      rows.push({
        slug,
        title: cleanTitle(title),
        category: "IMEI services",
        deliveryTime,
        priceCents,
        currency: "USD",
        sourceUrl: abs,
        tags: deriveTags(title),
      });
    });

    // Upsert
    await ctx.runMutation<typeof upsertMany>(
      "services_import:upsertMany",
      { rows }
    );

    // Return a tiny report
    return {
      count: rows.length,
      sample: rows.slice(0, 10),
    };
  },
});

// ---- helpers ----
function toSlug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
function cleanTitle(t: string) {
  return t.replace(/\s+/g, " ").replace(/\s-\s+/g, " - ").trim();
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
