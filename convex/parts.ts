import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

type PartItem = {
  title: string;
  device?: string;
  type?: string;
  query?: string;
  source?: string;
  partPrice?: number;
  labor?: number;
  total?: number;
  eta?: string;
  image?: string;
  createdAt?: number;
  updatedAt: number;
};

type PartsDoc = {
  _id: Id<"parts">;
  parts?: PartItem[];
  images?: string[];
  createdAt?: number;
  updatedAt?: number;
};

type FlatPart = {
  _id: Id<"parts">; // doc id
  title: string;
  device?: string;
  type?: string;
  query?: string;
  source?: string;
  partPrice?: number;
  labor?: number;
  total?: number;
  eta?: string;
  image?: string;
  updatedAt: number;
};

export const getAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 200 }) => {
    return await ctx.db.query("parts").order("desc").take(limit);
  },
});

// Flatten: docs[].parts[] → FlatPart[]
export const searchFlat = query({
  args: {
    q: v.optional(v.string()),
    limitDocs: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { q, limitDocs = 200, limit = 200 }) => {
    const docs = (await ctx.db
      .query("parts")
      .order("desc")
      .take(limitDocs)) as PartsDoc[];

    const out: FlatPart[] = [];

    for (const d of docs) {
      const items = d.parts ?? [];
      for (const p of items) {
        out.push({
          _id: d._id,
          title: p.title,
          device: p.device,
          type: p.type,
          query: p.query,
          source: p.source,
          partPrice: p.partPrice,
          labor: p.labor,
          total: p.total,
          eta: p.eta,
          image: p.image,
          updatedAt: p.updatedAt,
        });
      }
    }

    if (q && q.trim()) {
      const needle = q.toLowerCase();
      const filtered = out.filter((x) =>
        [
          x.title,
          x.device,
          x.type,
          x.query,
          x.source,
        ].some((f) => f?.toLowerCase().includes(needle))
      );
      return filtered.slice(0, limit);
    }

    return out.slice(0, limit);
  },
});

// Create: wrap a single part into doc.parts[] to match schema
export const create = mutation({
  args: v.object({
    title: v.string(),
    device: v.optional(v.string()),
    type: v.optional(v.string()),
    query: v.optional(v.string()),
    source: v.optional(v.string()),
    partPrice: v.optional(v.number()),
    labor: v.optional(v.number()),
    total: v.optional(v.number()),
    eta: v.optional(v.string()),
    image: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.number(),
  }),
  handler: async (ctx, part) => {
    const now = Date.now();
    const docId = await ctx.db.insert("parts", {
      parts: [part],
      images: [],
      createdAt: part.createdAt ?? now,
      updatedAt: part.updatedAt ?? now,
    });
    return docId;
  },
});

export const remove = mutation({
  args: v.object({ id: v.id("parts") }),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});

// Bulk ingest; optionally reset existing device docs, then insert provided items
export const ingestFromVendor = action({
  args: v.object({
    device: v.string(),
    count: v.optional(v.number()),
    reset: v.optional(v.boolean()),
    items: v.optional(
      v.array(
        v.object({
          title: v.string(),
          device: v.optional(v.string()),
          type: v.optional(v.string()),
          query: v.optional(v.string()),
          source: v.optional(v.string()),
          partPrice: v.optional(v.number()),
          labor: v.optional(v.number()),
          total: v.optional(v.number()),
          eta: v.optional(v.string()),
          image: v.optional(v.string()),
          createdAt: v.optional(v.number()),
          updatedAt: v.number(),
        })
      )
    ),
  }),
  handler: async (ctx, { device, count = 6, reset = false, items = [] }) => {
    if (reset) {
      const existing = (await ctx.runQuery(api.parts.getAll, {
        limit: 500,
      })) as PartsDoc[];

      const toDelete = existing.filter((x) =>
        (x.parts ?? []).some((p) => p.device === device)
      );

      for (const doc of toDelete) {
        await ctx.runMutation(api.parts.remove, { id: doc._id });
      }
    }

    const selected = items.slice(0, count);
    for (const part of selected) {
      await ctx.runMutation(api.parts.create, part);
    }

    return {
      device,
      inserted: selected.length,
      reset: !!reset,
    };
  },
});
