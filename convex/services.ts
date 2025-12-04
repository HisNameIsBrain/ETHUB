import { v } from "convex/values";
import { mutation, query, id, ctx} from "convex/_generated/server";
import { buildServiceSearch } from "convex/lib/search";

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

type IosfilesService = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  isPublic?: boolean;
  [k: string]: unknown;
};

export const fetchPublicIosfilesServices = action(async () => {
  const url = `${process.env.IOSFILES_BASE_URL || "https://iosfiles.com"}/api/imei-services`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(process.env.IOSFILES_API_KEY
        ? { Authorization: `Bearer ${process.env.IOSFILES_API_KEY}` }
        : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`iosfiles fetch failed: ${res.status}`);
  const data = (await res.json()) as IosfilesService[] | { data: IosfilesService[] };

  const list = Array.isArray(data) ? data : (data as any).data || [];
  return list
    .filter((s: any) => s?.isPublic === true)
    .map((s: any) => ({
      id: String(s.id),
      name: String(s.name ?? ""),
      description: String(s.description ?? ""),
      price: Number(s.price ?? 0),
    }));
});

/* --------------------- batch import (iOS Files) ------------------ */

const itemV = v.object({
  title: v.string(),
  description: v.optional(v.string()), // accepted, mapped to notes
  notes: v.optional(v.string()),
  price: v.optional(v.number()), // dollars
  priceCents: v.optional(v.number()), // cents (wins if present)
  currency: v.optional(v.string()),
  category: v.optional(v.string()),
  deliveryTime: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  sourceUrl: v.optional(v.string()),
  isPublic: v.optional(v.boolean()),
  archived: v.optional(v.boolean()),
  slug: v.optional(v.string()),
});

export const importServices = mutation({
  args: { items: v.array(itemV) },
  handler: async (ctx, { items }) => {
    const now = Date.now();
    let inserted = 0,
      updated = 0;

    for (const raw of items) {
      const title = raw.title?.trim();
      if (!title) continue;

      const notes = (raw.description ?? raw.notes) ?? "";
      const priceCents =
        typeof raw.priceCents === "number"
          ? Math.round(raw.priceCents)
          : typeof raw.price === "number"
          ? Math.round(raw.price * 100)
          : 0;

      const wantedSlug =
        (raw.slug && slugify(raw.slug)) || (await uniqueSlug(ctx, title));

      const existing = await ctx.db
        .query("services")
        .withIndex("by_slug", (q: any) => q.eq("slug", wantedSlug))
        .first();

      const patch = {
        slug: wantedSlug,
        title,
        notes,
        tags: raw.tags ?? [],
        category: raw.category ?? "",
        deliveryTime: raw.deliveryTime ?? "",
        priceCents,
        currency: raw.currency ?? "USD",
        sourceUrl: raw.sourceUrl ?? "",
        isPublic: raw.isPublic ?? true,
        archived: raw.archived ?? false,
        search: buildServiceSearch({
          title,
          notes,
          deliveryTime: raw.deliveryTime,
          tags: raw.tags,
        }),
      };

      if (existing) {
        await ctx.db.patch(existing._id, { ...patch, updatedAt: now });
        updated++;
      } else {
        await ctx.db.insert("services", { ...patch, createdAt: now, updatedAt: now });
        inserted++;
      }
    }

    return { inserted, updated, total: items.length };
  },
});

/* ---------------------------- mutations -------------------------- */

export const create = mutation({
  args: {
    title: v.string(),
    notes: v.optional(v.string()),
    priceCents: v.optional(v.number()),
    currency: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    deliveryTime: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    const slug = await uniqueSlug(ctx, args.title);

    return await ctx.db.insert("services", {
      slug,
      title: args.title,
      notes: args.notes,
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
    priceCents: v.optional(v.number()),
    currency: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    deliveryTime: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
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
    if (args.priceCents !== undefined) patch.priceCents = args.priceCents;
    if (args.currency !== undefined) patch.currency = args.currency;
    if (args.sourceUrl !== undefined) patch.sourceUrl = args.sourceUrl;
    if (args.category !== undefined) patch.category = args.category;
    if (args.deliveryTime !== undefined) patch.deliveryTime = args.deliveryTime;
    if (args.tags !== undefined) patch.tags = args.tags;
    if (args.isPublic !== undefined) patch.isPublic = args.isPublic;
    if (args.archived !== undefined) patch.archived = args.archived;

    // recompute search when relevant fields change
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

export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const admin = isAdminSubject(identity?.subject ?? null);

    if (admin) {
      // Use existing index by_createdAt, filter archived in memory
      const items = await ctx.db
        .query("services")
        .withIndex("by_createdAt", (q: any) => q.gte("createdAt", 0))
        .collect();

      return items
        .filter((s: any) => s.archived === false)
        .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }

    // Non-admin: by_isPublic then filter archived
    const items = await ctx.db
      .query("services")
      .withIndex("by_isPublic", (q: any) => q.eq("isPublic", true))
      .collect();

    return items
      .filter((s: any) => s.archived === false)
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  },
});

export const getById = query({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getArchived = query({
  args: {},
  handler: async (ctx) => {
    // No by_archived index presumed; read by_createdAt then filter
    const items = await ctx.db
      .query("services")
      .withIndex("by_createdAt", (q: any) => q.gte("createdAt", 0))
      .collect();
    return items.filter((s: any) => s.archived === true);
  },
});
