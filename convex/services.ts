// convex/services.ts
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
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

async function uniqueSlug(ctx: MutationCtx | QueryCtx, baseTitle: string) {
  const base = slugify(baseTitle) || "service";
  let slug = base, i = 1;
  // requires index: services.by_slug on "slug"
  while (true) {
    const ex = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!ex) return slug;
    slug = `${base}-${i++}`;
  }
}

/** Admin allow-lists (no DB migration needed). Set in env:
 *  ADMIN_SUBJECTS=user_abc,user_def
 *  ADMIN_EMAILS=you@example.com,admin@site.com
 */
const ADMIN_SUBJECTS = (process.env.ADMIN_SUBJECTS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isAdminIdentity(subject?: string | null, email?: string | null) {
  const bySubject = !!subject && ADMIN_SUBJECTS.includes(subject);
  const byEmail = !!email && ADMIN_EMAILS.includes(email.toLowerCase());
  return bySubject || byEmail;
}

async function requireAdmin(ctx: MutationCtx | QueryCtx) {
  const id = await ctx.auth.getUserIdentity();
  if (!id) throw new Error("Unauthorized");
  if (!isAdminIdentity(id.subject, id.email ?? null)) throw new Error("Forbidden");
  return id;
}

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
    const who = await requireAdmin(ctx);
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
      createdBy: who.subject, // track who created
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
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = { updatedAt: Date.now() };

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
      const existing = await ctx.db.get(args.id);
      const title = (patch.title as string | undefined) ?? existing?.title ?? "";
      const notes = (patch.notes as string | undefined) ?? existing?.notes ?? "";
      const deliveryTime = (patch.deliveryTime as string | undefined) ?? existing?.deliveryTime ?? "";
      const tags = (patch.tags as string[] | undefined) ?? existing?.tags ?? [];
      patch.search = buildServiceSearch({ title, notes, deliveryTime, tags });
    }

    await ctx.db.patch(args.id, patch);
  },
});

/* ----------------------------- remove ---------------------------- */

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
    const now = Date.now();

    // 1) Upsert by id
    if (args.id) {
      const patch: Record<string, unknown> = { ...args, updatedAt: now };
      delete patch.id;

      if (args.title !== undefined) {
        patch.title = args.title;
        patch.slug = await uniqueSlug(ctx, args.title);
      }

      if ("title" in patch || "notes" in patch || "deliveryTime" in patch || "tags" in patch) {
        // fetch existing to compose search fields correctly
        const ex = await ctx.db.get(args.id);
        const title = (patch.title as string | undefined) ?? ex?.title ?? "";
        const notes = (patch.notes as string | undefined) ?? ex?.notes ?? "";
        const deliveryTime = (patch.deliveryTime as string | undefined) ?? ex?.deliveryTime ?? "";
        const tags = (patch.tags as string[] | undefined) ?? ex?.tags ?? [];
        patch.search = buildServiceSearch({ title, notes, deliveryTime, tags });
      }

      await ctx.db.patch(args.id, patch);
      return args.id;
    }

    // 2) Upsert by slug, if provided
    const slugIn = args.slug?.trim();
    if (slugIn) {
      const ex = await ctx.db
        .query("services")
        .withIndex("by_slug", (q) => q.eq("slug", slugIn))
        .first();
      if (ex) {
        const patch: Record<string, unknown> = { ...args, updatedAt: now };
        if ("title" in patch || "notes" in patch || "deliveryTime" in patch || "tags" in patch) {
          const title = (patch.title as string | undefined) ?? ex.title ?? "";
          const notes = (patch.notes as string | undefined) ?? ex.notes ?? "";
          const deliveryTime = (patch.deliveryTime as string | undefined) ?? ex.deliveryTime ?? "";
          const tags = (patch.tags as string[] | undefined) ?? ex.tags ?? [];
          patch.search = buildServiceSearch({ title, notes, deliveryTime, tags });
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
 * Non-admins default to only public & non-archived.
 */
export const fetch = query({
  args: {
    needle: v.optional(v.string()),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
    sort: v.optional(v.string()),
    onlyPublic: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { needle, offset = 0, limit = 20, sort = "created_desc", onlyPublic = true }
  ) => {
    const id = await ctx.auth.getUserIdentity();
    const admin = isAdminIdentity(id?.subject ?? null, id?.email ?? null);

    let rows: any[] = [];
    const hasNeedle = !!needle && needle.trim().length > 0;

    if (hasNeedle) {
      const n = needle!.toLowerCase();
      // Prefer a search index if defined; fallback to scan+filter
      try {
        // @ts-ignore Present only if defined as a search index in schema
        rows = await ctx.db
          .query("services")
          .withSearchIndex("search_all", (q) => q.search("search", n))
          .collect();
      } catch {
        rows = await ctx.db
          .query("services")
          .withIndex("by_createdAt", (q) => q.gte("createdAt", 0))
          .collect();
        rows = rows.filter((s) => (s.search ?? "").toLowerCase().includes(n));
      }
    } else {
      rows = await ctx.db
        .query("services")
        .withIndex("by_createdAt", (q) => q.gte("createdAt", 0))
        .collect();
    }

    // visibility
    if (onlyPublic && !admin) {
      rows = rows.filter((s) => s.isPublic && !s.archived);
    } else {
      rows = rows.filter((s) => !s.archived);
    }

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

export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("services")
      .withIndex("by_isPublic_archived", (q) => q.eq("isPublic", true).eq("archived", false))
      .collect();
    return items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  },
});

export const getById = query({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) =>
    ctx.db.query("services").withIndex("by_slug", (q) => q.eq("slug", slug)).first(),
});

export const getArchived = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("services")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", 0))
      .collect();
    return items.filter((s) => s.archived === true);
  },
});
