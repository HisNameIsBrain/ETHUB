// convex/parts.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const cacheBundle = mutation({
  args: {
    query: v.string(),
    parts: v.optional(
      v.array(
        v.object({
          title: v.string(),
          device: v.optional(v.string()),
          category: v.optional(v.string()),
          partPrice: v.optional(v.number()),
          labor: v.optional(v.number()),
          total: v.optional(v.number()),
          type: v.optional(v.string()),
          eta: v.optional(v.string()),
          image: v.optional(v.string()),
          source: v.optional(v.string()),
          createdAt: v.optional(v.number()),
          updatedAt: v.optional(v.number()),
        })
      )
    ),
    images: v.optional(
      v.array(
        v.object({
          url: v.optional(v.string()),
          title: v.optional(v.string()),
          link: v.optional(v.string()),
          mime: v.optional(v.string()),
          thumbnail: v.optional(v.string()),
          contextLink: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const q = args.query.toLowerCase().trim();
    const now = Date.now();

    const existing = await ctx.db
      .query("parts")
      .withIndex("by_query", qry => qry.eq("query", q))
      .first();

    const normalizedParts =
      (args.parts ?? []).map(p => ({
        ...p,
        updatedAt: p.updatedAt ?? now,
        createdAt: p.createdAt ?? now,
      })) ?? [];

    if (existing) {
      await ctx.db.patch(existing._id, {
        parts: normalizedParts.length ? normalizedParts : existing.parts,
        images: args.images ?? existing.images,
        updatedAt: now,
      });
      return { upserted: "patched", id: existing._id };
    }

    const id = await ctx.db.insert("parts", {
      query: q,
      parts: normalizedParts,
      images: args.images ?? [],
      createdAt: now,
      updatedAt: now,
    });
    return { upserted: "inserted", id };
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const q = query.toLowerCase().trim();
    const bundle = await ctx.db
      .query("parts")
      .withIndex("by_query", idx => idx.eq("query", q))
      .order("desc")
      .first();

    if (!bundle) return { results: [] };

    const items = (bundle.parts ?? []).slice();
    // Premium first
    items.sort((a, b) => {
      const ap = (a.type ?? "").toLowerCase() === "premium" ? 0 : 1;
      const bp = (b.type ?? "").toLowerCase() === "premium" ? 0 : 1;
      return ap - bp;
    });

    const recommended = items[0] ?? null;
    const alternative = items.find(p => p !== recommended) ?? null;
    return { results: [recommended, alternative].filter(Boolean) };
  },
});

