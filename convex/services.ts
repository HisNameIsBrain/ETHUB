// convex/services.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { buildServiceSearch } from "./lib/search";

/* ---------------------------- helpers ---------------------------- */

function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function uniqueSlug(ctx: any, baseTitle: string) {
  const base = slugify(baseTitle) || "service";
  let slug = base, i = 1;
  while (true) {
    const ex = await ctx.db
      .query("services")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
    if (!ex) return slug;
    slug = `${base}-${i++}`;
  }
}

const ADMIN_SUBJECTS = (process.env.ADMIN_SUBJECTS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const isAdminSubject = (subject?: string | null) =>
  !!subject && ADMIN_SUBJECTS.includes(subject ?? "");

/* ----------------------------- create ---------------------------- */

export const create = mutation({
  args: {
    title: v.string(),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    deliveryTime: v.optional(v.string()),
    priceCents: v.optional(v.number()),
    currency: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const slug = await uniqueSlug(ctx, args.title);

    return await ctx.db.insert("services", {
      slug,
      title: args.title,
      notes: args.notes ?? "",
      tags: args.tags ?? [],
      category: args.category ?? "",
      deliveryTime: args.deliveryTime ?? "",
      priceCents: args.priceCents ?? 0,
      currency: args.currency ?? "USD",
      sourceUrl: args.sourceUrl ?? "",
      isPublic: args.isPublic ?? true,
      archived: args.archived ?? false,
      createdAt: now,
      updatedAt: now,
      search: buildServiceSearch({
        title: args.title,
        notes: args.notes,
        deliveryTime: args.deliveryTime,
        tags: args.tags,
      }),
    });
  },
});

/* ----------------------------- update ---------------------------- */

export const update = mutation({
  args: {
    id: v.id("services"),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    deliveryTime: v.optional(v.string()),
    priceCents: v.optional(v.number()),
    currency: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const patch: any = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      patch.title = args.title;
      patch.slug = await uniqueSlug(ctx, args.title);
    }
    if (args.notes !== undefined) patch.notes = args.notes;
    if (args.tags !== undefined) patch.tags = args.tags;
    if (args.category !== undefined) patch.category = args.category;
    if (args.deliveryTime !== undefined) patch.deliveryTime = args.deliveryTime;
    if (args.priceCents !== undefined) patch.priceCents = args.priceCents;
    if (args.currency !== undefined) patch.currency = args.currency;
    if (args.sourceUrl !== undefined) patch.sourceUrl = args.sourceUrl;
    if (args.isPublic !== undefined) patch.isPublic = args.isPublic;
    if (args.archived !== undefined) patch.archived = args.archived;

    if ("title" in patch || "notes" in patch || "deliveryTime" in patch || "tags" in patch) {
      patch.search = buildServiceSearch({
        title: patch.title,
        notes: patch.notes,
        deliveryTime: patch.deliveryTime,
        tags: patch.tags,
      });
    }

    await ctx.db.patch(args.id, patch);
  },
});

/* ----------------------------- remove ---------------------------- */

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/* ----------------------------- upsert ---------------------------- */
/** Update by id/slug or insert new (auto-slug from title) */
export const upsert = mutation({
  args: {
    id: v.optional(v.id("services")),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    deliveryTime: v.optional(v.string()),
    priceCents: v.optional(v.number()),
    currency: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 1) Upsert by id
    if (args.id) {
      const patch: any = { ...args, updatedAt: now };
      delete patch.id;

      if (args.title !== undefined) {
        patch.title = args.title;
        patch.slug = await uniqueSlug(ctx, args.title);
      }
      if ("title" in patch || "notes" in patch || "deliveryTime" in patch || "tags" in patch) {
        patch.search = buildServiceSearch({
          title: patch.title,
          notes: patch.notes,
          deliveryTime: patch.deliveryTime,
          tags: patch.tags,
        });
      }

      await ctx.db.patch(args.id, patch);
      return args.id;
    }

    // 2) Upsert by slug, if provided
    const slugIn = args.slug?.trim();
    if (slugIn) {
      const ex = await ctx.db
        .query("services")
        .withIndex("by_slug", (q: any) => q.eq("slug", slugIn))
        .first();
      if (ex) {
        const patch: any = { ...args, updatedAt: now };
        if ("title" in patch || "notes" in patch || "deliveryTime" in patch || "tags" in patch) {
          patch.search = buildServiceSearch({
            title: patch.title ?? ex.title,
            notes: patch.notes ?? ex.notes,
            deliveryTime: patch.deliveryTime ?? ex.deliveryTime,
            tags: patch.tags ?? ex.tags,
          });
        }
        await ctx.db.patch(ex._id, patch);
        return ex._id;
      }
    }

    // 3) Insert new
    const title = args.title ?? "Untitled";
    const slug = slugIn || (await uniqueSlug(ctx, title));
    const doc = {
      slug,
      title,
      notes: args.notes ?? "",
      tags: args.tags ?? [],
      category: args.category ?? "",
      deliveryTime: args.deliveryTime ?? "",
      priceCents: args.priceCents ?? 0,
      currency: args.currency ?? "USD",
      sourceUrl: args.sourceUrl ?? "",
      isPublic: args.isPublic ?? true,
      archived: args.archived ?? false,
      createdAt: now,
      updatedAt: now,
      search: buildServiceSearch({
        title,
        notes: args.notes,
        deliveryTime: args.deliveryTime,
        tags: args.tags,
      }),
    };
    return await ctx.db.insert("services", doc);
  },
});

/* ------------------------------ fetch ---------------------------- */
/** Paged list with optional search & sorting.
 * sort: "created_desc" (default) | "created_asc" | "price_asc" | "price_desc"
 */
export const fetch = query({
  args: {
    needle: v.optional(v.string()),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
    sort: v.optional(v.string()),
    onlyPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { needle, offset = 0, limit = 20, sort = "created_desc", onlyPublic = true }) => {
    const id = await ctx.auth.getUserIdentity();
    const admin = isAdminSubject(id?.subject ?? null);

    let rows: any[] = [];
    const hasNeedle = !!needle && needle.trim().length > 0;

    if (hasNeedle) {
      const n = needle!.toLowerCase();
      // Prefer a search index if defined; fallback to scan+filter
      try {
        // @ts-ignore present only if defined in schema
        rows = await ctx.db
          .query("services")
          .withSearchIndex("search_all", (q: any) => q.search("search", n))
          .collect();
      } catch {
        rows = await ctx.db
          .query("services")
          .withIndex("by_createdAt", (q: any) => q.gte("createdAt", 0))
          .collect();
        rows = rows.filter((s) => (s.search ?? "").includes(n));
      }
    } else {
      rows = await ctx.db
        .query("services")
        .withIndex("by_createdAt", (q: any) => q.gte("createdAt", 0))
        .collect();
    }

    // visibility
    if (onlyPublic && !admin) rows = rows.filter((s) => s.isPublic && !s.archived);
    else rows = rows.filter((s) => !s.archived);

    // sorting
    switch (sort) {
      case "created_asc":
        rows.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
        break;
      case "price_asc":
        rows.sort((a, b) => (a.priceCents ?? Infinity) - (b.priceCents ?? Infinity));
        break;
      case "price_desc":
        rows.sort((a, b) => (b.priceCents ?? -Infinity) - (a.priceCents ?? -Infinity));
        break;
      case "created_desc":
      default:
        rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }

    const total = rows.length;
    const services = rows.slice(offset, offset + limit);
    return {
      services,
      total,
      offset,
      newOffset: Math.min(offset + limit, total),
      hasMore: offset + limit < total,
    };
  },
});

/* --------------------------- convenience -------------------------- */

export const getById = query({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) =>
    ctx.db.query("services").withIndex("by_slug", (q: any) => q.eq("slug", slug)).first(),
});

export const getArchived = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("services")
      .withIndex("by_createdAt", (q: any) => q.gte("createdAt", 0))
      .collect();
    return items.filter((s) => s.archived === true);
  },
});
