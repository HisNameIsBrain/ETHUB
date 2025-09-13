import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function slugify(input: string) {
  return (input || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
async function uniqueSlug(ctx: any, baseName: string) {
  const base = slugify(baseName) || "service";
  let slug = base, i = 1;
  while (true) {
    const existing = await ctx.db.query("services").withIndex("by_slug", (q: any) => q.eq("slug", slug)).first();
    if (!existing) return slug;
    slug = `${base}-${i++}`;
  }
}

const ADMIN_SUBJECTS = (process.env.ADMIN_SUBJECTS ?? "").split(",").map(s => s.trim()).filter(Boolean);
function isAdminSubject(subject?: string | null) { return !!subject && ADMIN_SUBJECTS.includes(subject); }
async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !isAdminSubject(identity.subject)) throw new Error("Forbidden");
  return identity;
}

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.float64()),
    deliveryTime: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await requireAdmin(ctx);
    const now = Date.now();
    const slug = await uniqueSlug(ctx, args.name);
    return await ctx.db.insert("services", {
      name: args.name,
      description: args.description,
      price: args.price,
      deliveryTime: args.deliveryTime,
      isPublic: args.isPublic ?? true,
      archived: args.archived ?? false,
      slug,
      createdAt: now,
      updatedAt: now,
      createdBy: identity.subject,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.float64()),
    deliveryTime: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const patch: any = { updatedAt: Date.now() };
    if (args.name !== undefined) { patch.name = args.name; patch.slug = await uniqueSlug(ctx, args.name); }
    if (args.description !== undefined) patch.description = args.description;
    if (args.price !== undefined) patch.price = args.price;
    if (args.deliveryTime !== undefined) patch.deliveryTime = args.deliveryTime;
    if (args.isPublic !== undefined) patch.isPublic = args.isPublic;
    if (args.archived !== undefined) patch.archived = args.archived;
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const admin = isAdminSubject(identity?.subject ?? null);
    if (admin) {
      return (await ctx.db.query("services").withIndex("by_archived", (q: any) => q.eq("archived", false)).collect())
        .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }
    const items = await ctx.db
      .query("services")
      .withIndex("by_isPublic_archived", (q: any) => q.eq("isPublic", true).eq("archived", false))
      .collect();
    return items.sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
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
    return await ctx.db.query("services").withIndex("by_archived", (q: any) => q.eq("archived", true)).collect();
  },
});

export const search = query({
  args: { q: v.string(), offset: v.number(), limit: v.number() },
  handler: async (ctx, { q, offset, limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    const admin = isAdminSubject(identity?.subject ?? null);
    const base = admin
      ? await ctx.db.query("services").withIndex("by_archived", r => r.eq("archived", false)).collect()
      : await ctx.db.query("services").withIndex("by_isPublic_archived", r => r.eq("isPublic", true).eq("archived", false)).collect();
    const term = q.trim().toLowerCase();
    const filtered = term
      ? base.filter(s => (s?.name ?? "").toLowerCase().includes(term) || (s?.description ?? "").toLowerCase().includes(term))
      : base;
    const sorted = filtered.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return sorted.slice(offset, offset + limit);
  },
});

export const count = query({
  args: { q: v.string() },
  handler: async (ctx, { q }) => {
    const identity = await ctx.auth.getUserIdentity();
    const admin = isAdminSubject(identity?.subject ?? null);
    const base = admin
      ? await ctx.db.query("services").withIndex("by_archived", r => r.eq("archived", false)).collect()
      : await ctx.db.query("services").withIndex("by_isPublic_archived", r => r.eq("isPublic", true).eq("archived", false)).collect();
    const term = q.trim().toLowerCase();
    const filtered = term
      ? base.filter(s => (s?.name ?? "").toLowerCase().includes(term) || (s?.description ?? "").toLowerCase().includes(term))
      : base;
    return filtered.length;
  },
});
