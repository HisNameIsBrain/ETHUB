// convex/services_import.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

/** Strict row shape for bulk upsert by slug */
export const ServiceRowV = v.object({
  slug: v.string(),
  title: v.string(),
  category: v.optional(v.string()),
  deliveryTime: v.optional(v.string()),
  priceCents: v.optional(v.number()),
  currency: v.optional(v.string()),
  sourceUrl: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
});

export type ServiceRow = {
  slug: string;
  title: string;
  category?: string;
  deliveryTime?: string;
  priceCents?: number;
  currency?: string;
  sourceUrl?: string;
  tags?: string[];
};

/** Upsert many services by slug. */
export const upsertMany = mutation({
  args: { rows: v.array(ServiceRowV) },
  handler: async (ctx, { rows }) => {
    const now = Date.now();

    for (const r of rows) {
      const existing = await ctx.db
        .query("services")
        .withIndex("by_slug", (q: any) => q.eq("slug", r.slug))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: r.title,
          category: r.category ?? existing.category ?? "",
          deliveryTime: r.deliveryTime ?? existing.deliveryTime ?? "",
          priceCents: r.priceCents ?? existing.priceCents ?? 0,
          currency: r.currency ?? existing.currency ?? "USD",
          sourceUrl: r.sourceUrl ?? existing.sourceUrl ?? "",
          tags: r.tags ?? existing.tags ?? [],
          isPublic: true,
          archived: false,
        });
      } else {
        await ctx.db.insert("services", {
          slug: r.slug,
          title: r.title,
          category: r.category ?? "",
          deliveryTime: r.deliveryTime ?? "",
          priceCents: r.priceCents ?? 0,
          currency: r.currency ?? "USD",
          sourceUrl: r.sourceUrl ?? "",
          tags: r.tags ?? [],
          isPublic: true,
          archived: false,
          // search: buildServiceSearch({ title: r.title, deliveryTime: r.deliveryTime, tags: r.tags }),
        });
      }
    }
  },
});

