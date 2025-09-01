import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// utils
function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function uniqueSlug(ctx: any, baseName: string) {
  const base = slugify(baseName) || "service";
  let slug = base;
  let i = 1;
  while (true) {
    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
    if (!existing) return slug;
    slug = `${base}-${i++}`;
  }
}

// admin helper via env
const ADMIN_SUBJECTS = (process.env.ADMIN_SUBJECTS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAdminSubject(subject?: string | null) {
  return !!subject && ADMIN_SUBJECTS.includes(subject);
}

// mutations
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

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
    const patch: any = { updatedAt: Date.now() };
    if (args.name !== undefined) {
      patch.name = args.name;
      patch.slug = await uniqueSlug(ctx, args.name);
    }
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
    await ctx.db.delete(id);
  },
});

// queries
export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const admin = isAdminSubject(identity?.subject ?? null);

    if (admin) {
      // all non-archived
      return (
        await ctx.db
          .query("services")
          .withIndex("by_archived", (q: any) => q.eq("archived", false))
          .collect()
      ).sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }

    // public + non-archived (use combined index if available)
    const items = await ctx.db
      .query("services")
      .withIndex("by_isPublic_archived", (q: any) =>
        q.eq("isPublic", true).eq("archived", false),
      )
      .collect();

    return items.sort(
      (a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
    );
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
    return await ctx.db
      .query("services")
      .withIndex("by_archived", (q: any) => q.eq("archived", true))
      .collect();
  },
});
