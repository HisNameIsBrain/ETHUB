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
  let slug = base;
  let i = 1;
  while (true) {
    const ex = await ctx.db
      .query("services")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
    if (!ex) return slug;
    slug = `${base}-${i++}`;
  }
}

/* ------------------------- admin subjects ------------------------ */

const ADMIN_SUBJECTS = (process.env.ADMIN_SUBJECTS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAdminSubject(subject?: string | null) {
  return !!subject && ADMIN_SUBJECTS.includes(subject);
}

/* ---------------------------- mutations -------------------------- */

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

    // refresh search if relevant fields change
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

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/* ----------------------------- queries --------------------------- */

export const getById = query({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getPublic = query({
  args: {
    needle: v.optional(v.string()),
    sort: v.optional(v.string()), // "price_asc" | "price_desc"
  },
  handler: async (ctx, { needle, sort }) => {
    const admin = isAdminSubject((await ctx.auth.getUserIdentity())?.subject ?? null);

    let items: any[];
    if (needle && needle.trim()) {
      // Prefer a search index if you've defined one:
      // .withSearchIndex("search_all", q => q.search("search", needle.toLowerCase()))
      items = await ctx.db
        .query("services")
        .withIndex("by_createdAt", (q: any) => q.gte("createdAt", 0))
        .collect();
      const n = needle.toLowerCase();
      items = items.filter((s) => (s.search ?? "").includes(n));
    } else {
      items = await ctx.db
        .query("services")
        .withIndex("by_createdAt", (q: any) => q.gte("createdAt", 0))
        .collect();
    }

    // Non-admins only see public + non-archived
    if (!admin) items = items.filter((s) => s.isPublic && !s.archived);
    else items = items.filter((s) => !s.archived);

    // Safe sorting
    if (sort === "price_asc") {
      items.sort((a, b) => (a.priceCents ?? Infinity) - (b.priceCents ?? Infinity));
    } else if (sort === "price_desc") {
      items.sort((a, b) => (b.priceCents ?? -Infinity) - (a.priceCents ?? -Infinity));
    } else {
      // default: newest first
      items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }

    return items;
  },
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

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("services")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
  },
});
