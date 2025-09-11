import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---------- utils ----------
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
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!existing) return slug;
    slug = `${base}-${i++}`;
  }
}

function normalizePrice(price?: number | null, priceCents?: number | null): number {
  if (typeof price === "number") return price;
  if (typeof priceCents === "number") {
    const dollars = Math.round(priceCents) / 100;
    return Math.round(dollars * 100) / 100;
  }
  throw new Error("Missing price: provide price (number) or priceCents (number).");
}

const ADMIN_SUBJECTS = (process.env.ADMIN_SUBJECTS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAdminSubject(subject?: string | null) {
  return !!subject && ADMIN_SUBJECTS.includes(subject);
}

// ---------- mutations ----------
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    priceCents: v.optional(v.number()),
    deliveryTime: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    button: v.optional(
      v.object({
        label: v.string(),
        href: v.string(),
        variant: v.optional(
          v.union(
            v.literal("default"),
            v.literal("secondary"),
            v.literal("outline"),
            v.literal("ghost")
          )
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const price = normalizePrice(args.price, args.priceCents);
    const now = Date.now();
    const slug = await uniqueSlug(ctx, args.name);

    return await ctx.db.insert("services", {
      name: args.name,
      description: args.description,
      price, // ✅ matches schema
      deliveryTime: args.deliveryTime,
      isPublic: args.isPublic ?? true,
      archived: args.archived ?? false,
      imageUrl: args.imageUrl,
      sortOrder: args.sortOrder,
      button: args.button,
      slug,
      createdBy: identity.subject,

      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    priceCents: v.optional(v.number()),
    deliveryTime: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    button: v.optional(
      v.object({
        label: v.string(),
        href: v.string(),
        variant: v.optional(
          v.union(
            v.literal("default"),
            v.literal("secondary"),
            v.literal("outline"),
            v.literal("ghost")
          )
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, price, priceCents, ...rest } = args;
    const patch: Record<string, unknown> = { ...rest, updatedAt: Date.now() };

    if (rest.name !== undefined) {
      patch.name = rest.name;
      patch.slug = await uniqueSlug(ctx, rest.name);
    }

    if (price !== undefined || priceCents !== undefined) {
      patch.price = normalizePrice(price ?? undefined, priceCents ?? undefined);
    }

    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ---------- queries ----------
export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const admin = isAdminSubject(identity?.subject ?? null);

    if (admin) {
      const rows = await ctx.db
        .query("services")
        .withIndex("by_archived", (q) => q.eq("archived", false))
        .collect();

      return rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }

    const items = await ctx.db
      .query("services")
      .withIndex("by_isPublic_archived", (q) =>
        q.eq("isPublic", true).eq("archived", false)
      )
      .collect();

    return items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
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
      .withIndex("by_archived", (q) => q.eq("archived", true))
      .collect();
  },
});
