// convex/parts.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Latest parts documents (raw docs), ordered by createdAt desc.
 */
export const recent = query({
  args: v.object({
    limit: v.optional(v.number()),
  }),
  handler: async (ctx, { limit = 8 }) => {
    return await ctx.db
      .query("parts")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});

/**
 * Flattened search across recent parts docs, used by /api/parts.
 */
export const searchFlat = query({
  args: v.object({
    q: v.optional(v.string()),
    limitDocs: v.optional(v.number()),
    limit: v.optional(v.number()),
  }),
  handler: async (ctx, { q, limitDocs = 16, limit = 200 }) => {
    const docs = await ctx.db
      .query("parts")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limitDocs);

    const norm = (s: unknown) => (typeof s === "string" ? s.toLowerCase() : "");
    const Q = norm(q ?? "");

    const flat = docs.flatMap((d) =>
      (d.parts ?? []).map((p) => ({
        _docId: d._id,
        query: p.query,
        title: p.title,
        device: p.device,
        partPrice: p.partPrice,
        labor: p.labor,
        total: p.total,
        type: p.type,
        eta: p.eta,
        image: p.image,
        source: p.source,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }))
    );

    const filtered = Q
      ? flat.filter((p) =>
          `${p.title ?? ""} ${p.device ?? ""} ${p.type ?? ""} ${p.query ?? ""}`
            .toLowerCase()
            .includes(Q)
        )
      : flat;

    return filtered.slice(0, limit);
  },
});

/**
 * Flattened parts filtered by device name.
 */
export const byDeviceFlat = query({
  args: v.object({
    device: v.string(),
    limitDocs: v.optional(v.number()),
    limit: v.optional(v.number()),
  }),
  handler: async (ctx, { device, limitDocs = 16, limit = 200 }) => {
    const docs = await ctx.db
      .query("parts")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limitDocs);

    const D = device.toLowerCase();

    const flat = docs.flatMap((d) =>
      (d.parts ?? [])
        .filter((p) => (p.device ?? "").toLowerCase().includes(D))
        .map((p) => ({
          _docId: d._id,
          query: p.query,
          title: p.title,
          device: p.device,
          partPrice: p.partPrice,
          labor: p.labor,
          total: p.total,
          type: p.type,
          eta: p.eta,
          image: p.image,
          source: p.source,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }))
    );

    return flat.slice(0, limit);
  },
});

/**
 * Create a new parts doc (parts[] + optional images[]).
 */
export const createDoc = mutation({
  args: v.object({
    parts: v.array(
      v.object({
        query: v.optional(v.string()),
        title: v.string(),
        device: v.optional(v.string()),
        partPrice: v.optional(v.number()),
        labor: v.optional(v.number()),
        total: v.optional(v.number()),
        type: v.optional(v.string()),
        eta: v.optional(v.string()),
        image: v.optional(v.string()),
        source: v.optional(v.string()),
        createdAt: v.optional(v.number()),
        updatedAt: v.number(),
      })
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
          alt: v.optional(v.string()),
        })
      )
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.insert("parts", args);
  },
});

/**
 * Append parts/images to an existing parts doc.
 */
export const appendToDoc = mutation({
  args: v.object({
    docId: v.id("parts"),
    parts: v.array(
      v.object({
        query: v.optional(v.string()),
        title: v.string(),
        device: v.optional(v.string()),
        partPrice: v.optional(v.number()),
        labor: v.optional(v.number()),
        total: v.optional(v.number()),
        type: v.optional(v.string()),
        eta: v.optional(v.string()),
        image: v.optional(v.string()),
        source: v.optional(v.string()),
        createdAt: v.optional(v.number()),
        updatedAt: v.number(),
      })
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
          alt: v.optional(v.string()),
        })
      )
    ),
  }),
  handler: async (ctx, { docId, parts, images }) => {
    const doc = await ctx.db.get(docId);
    if (!doc) return { ok: false, reason: "not_found" };

    await ctx.db.patch(docId, {
      parts: [...(doc.parts ?? []), ...parts],
      images: images ? [...(doc.images ?? []), ...images] : doc.images,
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});

/**
 * Replace a parts doc’s contents.
 */
export const replaceDoc = mutation({
  args: v.object({
    docId: v.id("parts"),
    parts: v.array(
      v.object({
        query: v.optional(v.string()),
        title: v.string(),
        device: v.optional(v.string()),
        partPrice: v.optional(v.number()),
        labor: v.optional(v.number()),
        total: v.optional(v.number()),
        type: v.optional(v.string()),
        eta: v.optional(v.string()),
        image: v.optional(v.string()),
        source: v.optional(v.string()),
        createdAt: v.optional(v.number()),
        updatedAt: v.number(),
      })
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
          alt: v.optional(v.string()),
        })
      )
    ),
  }),
  handler: async (ctx, { docId, parts, images }) => {
    const doc = await ctx.db.get(docId);
    if (!doc) return { ok: false, reason: "not_found" };

    await ctx.db.patch(docId, {
      parts,
      images: images ?? doc.images,
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});

/**
 * Delete a parts doc.
 */
export const removeDoc = mutation({
  args: v.object({
    docId: v.id("parts"),
  }),
  handler: async (ctx, { docId }) => {
    const doc = await ctx.db.get(docId);
    if (!doc) return { ok: false, reason: "not_found" };
    await ctx.db.delete(docId);
    return { ok: true };
  },
});
