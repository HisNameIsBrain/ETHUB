import { mutation, type ActionCtx } from "./_generated/server";
import type { ServiceRow } from "app/api/servicesRows";
import { v } from "convex/values";

export const upsertMany = mutation({
  args: { rows: v.array(v.any()) }, // or mirror ServiceRow with v.object
  handler: async (ctx, { rows }) => {
    for (const r of rows as ServiceRow[]) {
      const existing = await ctx.db
        .query("services")
        .withIndex("by_slug", (q) => q.eq("slug", r.slug))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, {
          title: r.title,
          deliveryTime: r.deliveryTime,
          priceCents: r.priceCents,
          sourceUrl: r.sourceUrl,
          tags: r.tags,
          archived: false,
          isPublic: true,
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
