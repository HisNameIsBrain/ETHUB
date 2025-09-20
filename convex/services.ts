import { buildServiceSearch } from "./lib/search";
import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";

const now = () => Date.now();

export const search = query({
  args: { needle: v.string() },
  handler: async (ctx, { needle }) => {
    const term = needle.trim().toLowerCase();
    if (!term) return [];

    return await ctx.db
      .query("services")
      .withSearchIndex("search_all", (q) => q.search("search", term))
      .collect();
  },
});

export const upsert = mutation({
  args: {
    r: v.object({
      slug: v.optional(v.string()),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      createdAt: v.number(),
      title: v.string(),
      updatedAt: v.number(),
      category: v.string(),
      deliveryTime: v.string(),
      priceCents: v.number(),
      currency: v.string(),
      sourceUrl: v.string(),
      isPublic: v.boolean(),
      archived: v.boolean(),
      device: v.optional(v.string()), // only if you chose Option B above
    }),
  },
  handler: async (ctx, { r }) => {
    const search = [
      r.title,
      r.category,
      r.deliveryTime,
      r.notes ?? "",
      (r.tags ?? []).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", r.slug ?? ""))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...r, search, updatedAt: now(), search: buildServiceSearch({ ...r, search, updatedAt: now() }) });
    } else {
      await ctx.db.insert("services", {
        ...r,
        search,
        isPublic: r.isPublic ?? true,
        archived: false,
        createdAt: now(),
        updatedAt: now(),
      });
    }
  },
});


export const create = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    category: v.string(),
    deliveryTime: v.string(),
    priceCents: v.number(),
    currency: v.string(),
    sourceUrl: v.string(),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, a) => {
    const dup = await ctx.db.query("services").withIndex("by_slug", q => q.eq("slug", a.slug)).first();
    if (dup) throw new Error("slug_taken");
    return ctx.db.insert("services", {
      ...a,
      isPublic: a.isPublic ?? true,
      archived: false,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    patch: v.object({
      title: v.optional(v.string()),
      category: v.optional(v.string()),
      deliveryTime: v.optional(v.string()),
      priceCents: v.optional(v.number()),
      currency: v.optional(v.string()),
      sourceUrl: v.optional(v.string()),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      isPublic: v.optional(v.boolean()),
      archived: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("not_found");
    await ctx.db.patch(id, { ...patch, updatedAt: now(), search: buildServiceSearch({ ...patch, updatedAt: now() }) });
    return id;
  },
});

export const archive = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("not_found");
    await ctx.db.patch(id, { archived: true, isPublic: false, updatedAt: now(), search: buildServiceSearch({ archived: true, isPublic: false, updatedAt: now() }) });
    return id;
  },
});

export const restore = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("not_found");
    await ctx.db.patch(id, { archived: false, updatedAt: now(), search: buildServiceSearch({ archived: false, updatedAt: now() }) });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});

export const getById = query({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) =>
    ctx.db.query("services").withIndex("by_slug", q => q.eq("slug", slug)).first(),
});

export const getAll = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    includeArchived: v.optional(v.boolean()),
    sort: v.optional(v.union(v.literal("new"), v.literal("price_asc"), v.literal("price_desc"))),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("services")),
  },
  handler: async (ctx, args) => {
    const {
      search = "",
      category,
      isPublic = true,
      includeArchived = false,
      sort = "new",
      limit = 50,
      cursor,
    } = args;

    let q = ctx.db.query("services");
    if (!includeArchived) q = q.filter(s => s.eq(s.field("archived"), false));
    if (typeof isPublic === "boolean") q = q.filter(s => s.eq(s.field("isPublic"), isPublic));
    if (category) q = q.filter(s => s.eq(s.field("category"), category));

    if (search.trim()) {
      const needle = search.toLowerCase();
      q = q.filter(s =>
        s.or(
          s.contains(s.field("title"), needle),
          s.contains(s.field("category"), needle),
          s.contains(s.field("deliveryTime"), needle),
          s.contains(s.field("notes"), needle),
        ),
      );
    }

    let results = await q.collect();
    if (sort === "new") results.sort((a, b) => b.createdAt - a.createdAt);
    if (sort === "price_asc") results.sort((a, b) => a.priceCents - b.priceCents);
    if (sort === "price_desc") results.sort((a, b) => b.priceCents - a.priceCents);

    if (cursor) {
      const i = results.findIndex(r => r._id === cursor);
      if (i >= 0) results = results.slice(i + 1);
    }
    const page = results.slice(0, limit);
    const nextCursor = results.length > limit ? page[page.length - 1]?._id ?? null : null;
    return { page, nextCursor };
  },
});

/** Batch upsert (used by scraper) */
export const upsertBatch = action({
  args: {
    rows: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        category: v.string(),
        deliveryTime: v.string(),
        priceCents: v.number(),
        currency: v.string(),
        sourceUrl: v.string(),
        notes: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        isPublic: v.optional(v.boolean()),
      }),
    ),
  },
  handler: async (ctx, { rows }) => {
    for (const r of rows) {
      const ex = await ctx.db.query("services").withIndex("by_slug", q => q.eq("slug", r.slug)).first();
      if (ex) await ctx.db.patch(ex._id, { ...r, updatedAt: now(), search: buildServiceSearch({ ...r, updatedAt: now() }) });
      else await ctx.db.insert("services", { ...r, isPublic: r.isPublic ?? true, archived: false, createdAt: now(), updatedAt: now(), search: buildServiceSearch({ ...r, isPublic: r.isPublic ?? true, archived: false, createdAt: now(), updatedAt: now() }) });
    }
    return { count: rows.length };
  },
});
