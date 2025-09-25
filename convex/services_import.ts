// convex/services_import.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

/** Shared row shape */
export const ServiceRowV = v.object({
  slug: v.string(),
  title: v.string(),
  category: v.string(),
  deliveryTime: v.string(),
  priceCents: v.number(),
  currency: v.literal("USD"),
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

/**
 * Upsert many services by slug.
 * - Updates fields and sets isPublic=true, archived=false, updatedAt=now
 * - Inserts with createdAt/updatedAt
 */
export const upsertMany = mutation({
  args: { rows: v.array(ServiceRowV) },
  handler: async (ctx, { rows }) => {
    const now = Date.now();

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
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("services", {
          slug: r.slug,
          title: r.title,
          category: r.category,
          deliveryTime: r.deliveryTime,
          priceCents: r.priceCents,
          currency: r.currency,
          sourceUrl: r.sourceUrl,
          tags: r.tags,
          isPublic: true,
          archived: false,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  },
});

/** Archive any public service not present in keepSlugs */
export const archiveMissing = mutation({
  args: { keepSlugs: v.array(v.string()) },
  handler: async (ctx, { keepSlugs }) => {
    const keep = new Set(keepSlugs);
    const now = Date.now();
    const all = await ctx.db.query("services").collect();

    for (const s of all) {
      const slug = (s as any).slug as string | undefined;
      if (!slug) continue;
      if (s.isPublic === true && !keep.has(slug)) {
        await ctx.db.patch(s._id, { archived: true, updatedAt: now });
      }
    }
  },
});
